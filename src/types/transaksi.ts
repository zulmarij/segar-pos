import { TransaksiFormValues } from "@/schemas/transaksi-form-schema";
import { ApiResponse } from "@/types/api";

export interface TransaksiResponse extends ApiResponse {
  data: TransaksiFormValues;
}
