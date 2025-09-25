import { BiayaPengantaranResponse } from "@/types/biaya-pengantaran";

export async function getBiayaPengantaran(): Promise<BiayaPengantaranResponse> {
  const res = await fetch("/api/biaya-pengantaran");
  const data = await res.json();

  if (!res.ok)
    throw new Error(data.message || "Failed to get biaya pengantaran");

  return data;
}
