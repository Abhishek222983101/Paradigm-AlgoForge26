import { NextRequest, NextResponse } from "next/server";
import { anonymizePatientData, HIPAA_COMPLIANCE } from "@/lib/hipaa";
import { auditLogger } from "@/lib/auditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientData, userId = "system", userRole = "admin" } = body;

    if (!patientData) {
      return NextResponse.json(
        { error: "Patient data is required" },
        { status: 400 }
      );
    }

    const result = anonymizePatientData(patientData);

    auditLogger.log(
      "ANONYMIZE_DATA",
      userId,
      userRole,
      {
        details: `Anonymized ${result.entityMap.length} entities`,
        status: "success",
        patientId: patientData.id || "unknown"
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      compliance: HIPAA_COMPLIANCE
    });

  } catch (error) {
    console.error("Anonymization error:", error);
    return NextResponse.json(
      { error: "Failed to anonymize data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    compliance: HIPAA_COMPLIANCE,
    status: "operational",
    features: {
      anonymization: true,
      encryption: true,
      auditLogging: true,
      consentManagement: true,
      sessionSecurity: true
    }
  });
}
