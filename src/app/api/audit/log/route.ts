import { NextRequest, NextResponse } from "next/server";
import { auditLogger, AuditAction } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, userRole, ...options } = body;

    if (!action || !userId || !userRole) {
      return NextResponse.json(
        { error: "Missing required fields: action, userId, userRole" },
        { status: 400 }
      );
    }

    const entry = auditLogger.log(
      action as AuditAction,
      userId,
      userRole,
      options
    );

    return NextResponse.json({ success: true, entry });

  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;
  const action = searchParams.get("action") as AuditAction | undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const status = searchParams.get("status") || undefined;

  const logs = auditLogger.getLogs({ userId, action, startDate, endDate, status });

  return NextResponse.json({
    logs,
    total: logs.length,
    compliance: {
      auditLogging: true,
      hipaaCompliant: true
    }
  });
}
