import { getRows, addRow } from "@/lib/google-spreadsheet";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await getRows("Database", { parseNumber: true });

    return NextResponse.json({
      success: true,
      data: rows,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transactionData = {
      Tanggal: "",
      "No Invoice": "",
      Waktu: "",
      "Jumlah Galon": body.jumlahGalon,
      Total: "",
      Promo: body.promo,
      "Free Isi Galon": "",
      "Jumlah Total Galon": "",
      "Diskon Bundling": "",
      "Sub Total": "",
      Antar: body.pengantaran,
      "Total Galon Diantar": body.totalGalonDiantar,
      "Biaya Antar": "",
      "Grand Total": "",
      "Cara Bayar": body.caraBayar,
      "Nominal Bayar": body.nominalBayar,
      Kembalian: "",
      Remarks: body.remarks,
      Cetak: "",
      // Total: body.total,
      // "Free Isi Galon": body.freeIsiGalon,
      // "Jumlah Total Galon": body.totalGalon,
      // "Diskon Bundling": body.diskonBundling,
      // "Sub Total": body.subTotal,
      // "Biaya Antar": body.biayaPengantaran,
      // "Grand Total": body.grandTotal,
      // Kembalian: body.kembalian,
    };

    const result = await addRow("Database", transactionData);

    return NextResponse.json({
      success: true,
      message: "Transaction added successfully",
      data: result,
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
