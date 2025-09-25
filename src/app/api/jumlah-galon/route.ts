import { getColumnValues } from "@/lib/google-spreadsheet";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const values = await getColumnValues("Menu", "Jumlah Galon", {
      offset: 1,
      limit: 100,
      parseNumber: true,
    });
    return NextResponse.json({
      success: true,
      data: values,
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
