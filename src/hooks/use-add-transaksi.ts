import { useMutation } from "@tanstack/react-query";
import { addTransaksi } from "@/services/add-transaksi-service";
import { TransaksiFormValues } from "@/schemas/transaksi-form-schema";

export const useAddTransaksi = () => {
  return useMutation({
    mutationFn: (data: TransaksiFormValues) => addTransaksi(data),
    onSuccess: (data) => {
      console.log("Transaction added successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to add transaction:", error);
    },
  });
};
