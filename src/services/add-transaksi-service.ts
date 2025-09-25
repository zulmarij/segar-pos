import { TransaksiFormValues } from "@/schemas/transaksi-form-schema";
import { TransaksiResponse } from "@/types/transaksi";

export async function addTransaksi(
  data: TransaksiFormValues
): Promise<TransaksiResponse> {
  try {
    const response = await fetch("/api/transaksi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to add transaction");
    }

    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
