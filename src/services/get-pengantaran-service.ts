import { PengantaranResponse } from "@/types/pengantaran";

export async function getPengantaran(): Promise<PengantaranResponse> {
  const res = await fetch("/api/pengantaran");
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to get pengantaran");

  return data;
}
