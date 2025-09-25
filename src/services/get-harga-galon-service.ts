import { HargaGalonResponse } from "@/types/harga-galon";

export async function getHargaGalon(): Promise<HargaGalonResponse> {
  const res = await fetch("/api/harga-galon");
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to get harga galon");

  return data;
}
