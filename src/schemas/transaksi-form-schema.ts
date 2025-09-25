import { z } from "zod";

export const transaksiFormSchema = z
  .object({
    jumlahGalon: z.string().min(1, "Jumlah galon harus dipilih"),
    pengantaran: z.string().min(1, "Pilihan pengantaran harus dipilih"),
    promo: z.string().min(1, "Promo harus dipilih"),
    caraBayar: z.string().min(1, "Cara bayar harus dipilih"),
    nominalBayar: z
      .string()
      .min(1, "Nominal bayar harus diisi")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Nominal bayar harus berupa angka yang valid dan lebih dari 0",
      }),
    remarks: z.string().optional(),
    diskonBundling: z.string().optional(),
    total: z.string().optional(),
    freeIsiGalon: z.string().optional(),
    totalGalon: z.string().optional(),
    totalGalonDiantar: z.string().optional(),
    biayaPengantaran: z.string().optional(),
    grandTotal: z.string().optional(),
    kembalian: z.string().optional(),
    subTotal: z.string().optional(),
  })
  .refine(
    (data) => {
      const totalGalon = parseInt(data.totalGalon || "0");
      const totalGalonDiantar = parseInt(data.totalGalonDiantar || "0");

      if (data.pengantaran === "Ya" && totalGalonDiantar > totalGalon) {
        return false;
      }
      return true;
    },
    {
      message: "Total Galon Diantar tidak boleh lebih dari Jumlah Total Galon",
      path: ["totalGalonDiantar"],
    }
  );

export type TransaksiFormValues = z.infer<typeof transaksiFormSchema>;

export const defaultTransaksiFormValues: TransaksiFormValues = {
  jumlahGalon: "",
  pengantaran: "",
  promo: "",
  caraBayar: "",
  nominalBayar: "",
  remarks: "",
  diskonBundling: "",
  freeIsiGalon: "",
  total: "",
  totalGalon: "",
  totalGalonDiantar: "",
  biayaPengantaran: "",
  grandTotal: "",
  kembalian: "",
  subTotal: "",
};
