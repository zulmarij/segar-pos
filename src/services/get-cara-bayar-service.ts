import { CaraBayarResponse } from "@/types/cara-bayar";

export async function getCaraBayar(): Promise<CaraBayarResponse> {
  const res = await fetch("/api/cara-bayar");
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to get cara bayar");

  return data;
}
