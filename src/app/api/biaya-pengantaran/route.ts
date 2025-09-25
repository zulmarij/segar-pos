import { getColumnValues } from "@/lib/google-spreadsheet";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const values = await getColumnValues("Menu", "Biaya Pengantaran", {
      offset: 1,
      limit: 1,
      parseNumber: true,
    });
    return NextResponse.json({
      success: true,
      data: values?.[0] || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
