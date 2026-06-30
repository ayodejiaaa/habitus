import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logSecurity } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  const origin = req.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard?payment=error&message=No%20reference%20provided", origin));
  }

  try {
    // 1. Fetch the corresponding request record
    const request = await db.inspectionRequest.findUnique({
      where: { paystackReference: reference },
      include: { service: true },
    });

    if (!request) {
      logSecurity("PAYMENT_VERIFICATION_FAILURE", {
        reason: `Verification callback attempted for non-existent reference: ${reference}`,
      });
      return NextResponse.redirect(new URL("/dashboard?payment=error&message=Request%20not%20found", origin));
    }

    // 2. If already marked paid, bypass redundant checks (idempotent redirect)
    if (request.paymentStatus === "PAID") {
      return NextResponse.redirect(new URL("/dashboard?payment=success", origin));
    }

    // 3. Enforce secret key configuration
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is missing on server.");
      return NextResponse.redirect(new URL("/dashboard?payment=error&message=Server%20configuration%20error", origin));
    }

    logSecurity("PAYMENT_VERIFICATION_ATTEMPT", {
      userId: request.userId,
      resourceType: "TRANSACTION",
      resourceId: reference,
      reason: `Initiating direct Paystack API verification for reference: ${reference} (Env: ${request.paymentEnvironment})`,
    });

    // 4. Query Paystack REST verification API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || paystackData.data?.status !== "success") {
      logSecurity("PAYMENT_VERIFICATION_FAILURE", {
        userId: request.userId,
        resourceType: "PAYMENT_VERIFICATION_FAILED",
        resourceId: reference,
        reason: `Paystack verification returned failure or unsuccessful status: ${paystackData.message || "Unknown error"}`,
      });
      return NextResponse.redirect(new URL("/dashboard?payment=failed&message=Transaction%20verification%20failed", origin));
    }

    const txData = paystackData.data;

    // 5. Securely validate amount matches expected service price (in kobo)
    const expectedAmountKobo = Math.round(request.service.price * 100);
    const receivedAmountKobo = txData.requested_amount || txData.amount;
    if (Math.round(receivedAmountKobo) !== expectedAmountKobo) {
      logSecurity("PAYMENT_VERIFICATION_FAILURE", {
        userId: request.userId,
        resourceType: "PAYMENT_AMOUNT_MISMATCH",
        resourceId: reference,
        reason: `Expected amount: ${expectedAmountKobo} kobo, received: ${receivedAmountKobo} kobo (fees: ${txData.fees || 0} kobo)`,
      });
      return NextResponse.redirect(new URL("/dashboard?payment=failed&message=Payment%20amount%20mismatch", origin));
    }

    // 6. Update database status
    await db.inspectionRequest.update({
      where: { id: request.id },
      data: {
        paymentStatus: "PAID",
        status: "PAYMENT_VERIFIED",
        paidAt: new Date(txData.paid_at || Date.now()),
        verifiedAt: new Date(),
        verificationResponse: txData as any,
      },
      select: { id: true },
    });

    logSecurity("PAYMENT_VERIFICATION_SUCCESS", {
      userId: request.userId,
      resourceType: "PAYMENT_VERIFIED_SUCCESS",
      resourceId: request.id,
      reason: `Successfully verified Paystack transaction. Reference: ${reference} (Env: ${request.paymentEnvironment})`,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/requests");

    return NextResponse.redirect(new URL("/dashboard?payment=success", origin));
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(new URL(`/dashboard?payment=error&message=${encodeURIComponent(error.message || "Verification failed")}`, origin));
  }
}
