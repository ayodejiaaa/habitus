import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const authSecret = process.env.AUTH_SECRET;

  const diagnostics = {
    databaseUrlDefined: !!dbUrl,
    databaseUrlLength: dbUrl ? dbUrl.length : 0,
    directUrlDefined: !!directUrl,
    directUrlLength: directUrl ? directUrl.length : 0,
    authSecretDefined: !!authSecret,
    authSecretLength: authSecret ? authSecret.length : 0,
    connectionStatus: "unknown",
    usersCount: 0,
    errorMessage: null as string | null,
  };

  try {
    if (!dbUrl) {
      diagnostics.connectionStatus = "skipped_no_url";
    } else {
      // Try to query the database
      const count = await db.user.count();
      diagnostics.usersCount = count;
      diagnostics.connectionStatus = "success";
    }
  } catch (err: any) {
    diagnostics.connectionStatus = "failed";
    diagnostics.errorMessage = err?.message || String(err);
  }

  return NextResponse.json(diagnostics);
}
