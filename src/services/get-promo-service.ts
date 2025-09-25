import { PromoResponse } from "@/types/promo";

export async function getPromo(): Promise<PromoResponse> {
  const res = await fetch("/api/promo");
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to get promo");

  return data;
}
