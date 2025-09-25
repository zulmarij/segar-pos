import { JumlahGalonResponse } from "@/types/jumlah-galon";

export async function getJumlahGalon(): Promise<JumlahGalonResponse> {
  const res = await fetch("/api/jumlah-galon");
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to get jumlah galon");

  return data;
}
