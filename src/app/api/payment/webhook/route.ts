import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { logSecurity } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      logSecurity("PAYMENT_WEBHOOK_SIGNATURE_INVALID", {
        reason: "Paystack webhook request missing x-paystack-signature header",
      });
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("PAYSTACK_WEBHOOK_SECRET is missing from environment variables.");
      return NextResponse.json({ error: "Server webhook configuration error" }, { status: 500 });
    }

    // 1. Verify HMAC SHA512 Signature
    const hash = crypto
      .createHmac("sha512", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      logSecurity("PAYMENT_WEBHOOK_SIGNATURE_INVALID", {
        reason: `Paystack webhook signature verification failed. Computed: ${hash.slice(0, 10)}..., Received: ${signature.slice(0, 10)}...`,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    console.log(`Received Paystack Webhook Event: ${eventType}`);

    // We only process successful charges
    if (eventType !== "charge.success") {
      return NextResponse.json({ status: "ignored", event: eventType }, { status: 200 });
    }

    const txData = payload.data;
    const reference = txData.reference;

    if (!reference) {
      return NextResponse.json({ error: "No reference found in payload" }, { status: 400 });
    }

    // 2. Fetch the corresponding request record
    const request = await db.inspectionRequest.findUnique({
      where: { paystackReference: reference },
      include: { service: true },
    });

    if (!request) {
      logSecurity("PAYMENT_VERIFICATION_FAILURE", {
        reason: `Paystack webhook received charge success for non-existent reference: ${reference}`,
      });
      // Return 200 to acknowledge receipt and prevent Paystack from retrying endlessly
      return NextResponse.json({ status: "not_found", reference }, { status: 200 });
    }

    // 3. Idempotent check: If already processed via redirect callback or previous webhook, ignore
    if (request.webhookProcessed) {
      logSecurity("PAYMENT_WEBHOOK_DUPLICATE", {
        userId: request.userId,
        resourceType: "TRANSACTION",
        resourceId: reference,
        reason: `Paystack webhook reference ${reference} has already been processed (ignoring duplicate event).`,
      });
      return NextResponse.json({ status: "duplicate", reference }, { status: 200 });
    }

    // 4. Verify transaction amount matches expected price (in kobo)
    const expectedAmountKobo = Math.round(request.service.price * 100);
    if (Math.round(txData.amount) !== expectedAmountKobo) {
      logSecurity("PAYMENT_VERIFICATION_FAILURE", {
        userId: request.userId,
        resourceType: "PAYMENT_AMOUNT_MISMATCH",
        resourceId: reference,
        reason: `Webhook amount mismatch. Expected: ${expectedAmountKobo} kobo, received: ${txData.amount} kobo`,
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 200 });
    }

    // 5. Update database status
    await db.inspectionRequest.update({
      where: { id: request.id },
      data: {
        paymentStatus: "PAID",
        status: "PAYMENT_VERIFIED",
        paidAt: new Date(txData.paid_at || Date.now()),
        verifiedAt: new Date(),
        webhookProcessed: true,
        webhookProcessedAt: new Date(),
        verificationResponse: txData as any,
      },
      select: { id: true },
    });

    logSecurity("PAYMENT_WEBHOOK_PROCESSED", {
      userId: request.userId,
      resourceType: "PAYMENT_WEBHOOK_PROCESSED",
      resourceId: request.id,
      reason: `Successfully processed Paystack webhook charge.success. Reference: ${reference} (Env: ${request.paymentEnvironment})`,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/requests");

    return NextResponse.json({ status: "success", reference }, { status: 200 });
  } catch (error: any) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
