"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defaultTransaksiFormValues,
  transaksiFormSchema,
  TransaksiFormValues,
} from "@/schemas/transaksi-form-schema";
import { Textarea } from "@/components/ui/textarea";
import { useGetPromo } from "@/hooks/use-get-promo";
import { useGetJumlahGalon } from "@/hooks/use-get-jumlah-galon";
import { useGetHargaGalon } from "@/hooks/use-get-harga-galon";
import { useGetCaraBayar } from "@/hooks/use-get-cara-bayar";
import { useGetBiayaPengantaran } from "@/hooks/use-get-biaya-pengantaran";
import { useEffect } from "react";
import { NumberInput } from "@/components/shared/number-input";
import { useAddTransaksi } from "@/hooks/use-add-transaksi";
import { toast } from "sonner";
import { useGetPengantaran } from "@/hooks/use-get-pengantaran";

export default function TransaksiForm() {
  const { data: biayaPengantaran } = useGetBiayaPengantaran();
  const { data: caraBayar, isLoading: isLoadingCaraBayar } = useGetCaraBayar();
  const { data: hargaGalon } = useGetHargaGalon();
  const { data: jumlahGalon, isLoading: isLoadingJumlahGalon } =
    useGetJumlahGalon();
  const { data: pengantaran, isLoading: isLoadingPengantaran } =
    useGetPengantaran();
  const { data: promo, isLoading: isLoadingPromo } = useGetPromo();

  const addTransaksiMutation = useAddTransaksi();

  const form = useForm<TransaksiFormValues>({
    resolver: zodResolver(transaksiFormSchema),
    defaultValues: defaultTransaksiFormValues,
  });

  // Watch form fields that affect calculations
  const watchedFields = form.watch([
    "jumlahGalon",
    "promo",
    "pengantaran",
    "nominalBayar",
    "totalGalonDiantar",
  ]);

  const [
    jumlahGalonValue,
    promoValue,
    pengantaranValue,
    nominalBayarValue,
    totalGalonDiantarValue,
  ] = watchedFields;

  // Automatic calculations
  useEffect(() => {
    const jumlahGalonNum = parseInt(jumlahGalonValue) || 0;
    const hargaPerGalon = hargaGalon?.data || 0;
    const biayaAntar = biayaPengantaran?.data || 0;
    const nominalBayarNum = parseInt(nominalBayarValue) || 0;

    // Calculate total (basic price before promo)
    const total = jumlahGalonNum * hargaPerGalon;
    form.setValue("total", total.toString());

    // Calculate free isi galon and total galon based on promo
    let freeIsiGalonNum = 0;
    let totalGalonNum = jumlahGalonNum;
    let diskonBundlingNum = 0;

    if (promoValue === "Beli 1 Gratis 1") {
      freeIsiGalonNum = jumlahGalonNum;
      totalGalonNum = jumlahGalonNum + freeIsiGalonNum;
    } else if (promoValue === "Beli 2 Gratis 1") {
      freeIsiGalonNum = Math.floor(jumlahGalonNum / 2);
      totalGalonNum = jumlahGalonNum + freeIsiGalonNum;
    } else if (promoValue === "Bundling") {
      // For bundling, apply discount (example: 10% discount)
      diskonBundlingNum = total * 0.1;
      totalGalonNum = jumlahGalonNum;
    } else {
      totalGalonNum = jumlahGalonNum;
    }

    form.setValue("freeIsiGalon", freeIsiGalonNum.toString());
    form.setValue("totalGalon", totalGalonNum.toString());
    form.setValue("diskonBundling", diskonBundlingNum.toString());

    // Calculate sub total (total - diskon bundling)
    const subTotal = total - diskonBundlingNum;
    form.setValue("subTotal", subTotal.toString());

    // Auto-fill total galon diantar if pengantaran is selected and field is empty
    if (pengantaranValue === "Ya" && !totalGalonDiantarValue) {
      form.setValue("totalGalonDiantar", totalGalonNum.toString());
    } else if (pengantaranValue === "Tidak") {
      form.setValue("totalGalonDiantar", "0");
    }

    // Calculate delivery cost
    let biayaPengantaranNum = 0;
    if (pengantaranValue === "Ya") {
      if (promoValue === "Free Delivery") {
        biayaPengantaranNum = 0;
      } else {
        biayaPengantaranNum = biayaAntar;
      }
    }
    form.setValue("biayaPengantaran", biayaPengantaranNum.toString());

    // Calculate grand total
    const grandTotal = subTotal + biayaPengantaranNum;
    form.setValue("grandTotal", grandTotal.toString());

    // Calculate kembalian (change)
    const kembalian = nominalBayarNum - grandTotal;
    form.setValue("kembalian", kembalian.toString());
  }, [
    jumlahGalonValue,
    promoValue,
    pengantaranValue,
    nominalBayarValue,
    totalGalonDiantarValue,
    hargaGalon?.data,
    biayaPengantaran?.data,
    form,
  ]);

  const onSubmit = (data: TransaksiFormValues) => {
    toast.loading("Menambah transaksi...");

    addTransaksiMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Transaksi berhasil ditambahkan!");
        handleClear();
      },
      onError: (error) => {
        toast.error(`Gagal menambah transaksi: ${error.message}`);
      },
    });
  };

  const handleClear = () => {
    form.reset(defaultTransaksiFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="jumlahGalon"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Jumlah Galon</FormLabel>
                <div className="w-48">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingJumlahGalon}
                  >
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue
                          placeholder={
                            isLoadingJumlahGalon
                              ? "Loading..."
                              : "Pilih jumlah galon"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jumlahGalon?.data?.map((galon) => (
                        <SelectItem
                          key={`galon-${galon}`}
                          value={galon.toString()}
                        >
                          {galon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Total</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput readOnly className="bg-gray-50" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promo"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Promo</FormLabel>
                <div className="w-48">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPromo}
                  >
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue
                          placeholder={
                            isLoadingPromo ? "Loading..." : "Pilih promo"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {promo?.data?.map((promoItem, index) => (
                        <SelectItem key={`promo-${index}`} value={promoItem}>
                          {promoItem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="freeIsiGalon"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Free Isi Galon</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <Input
                      type="number"
                      readOnly
                      className="bg-gray-50"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalGalon"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Jumlah Total Galon</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <Input
                      type="number"
                      readOnly
                      className="bg-gray-50"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diskonBundling"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Diskon Bundling</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput readOnly className="bg-gray-50" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subTotal"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Sub Total</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput readOnly className="bg-gray-50" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pengantaran"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Pengantaran</FormLabel>
                <div className="w-48">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPengantaran}
                  >
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue
                          placeholder={
                            isLoadingPengantaran
                              ? "Loading..."
                              : "Pilih pengantaran"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pengantaran?.data?.map((pengantaranItem, index) => (
                        <SelectItem
                          key={`pengantaran-${index}`}
                          value={pengantaranItem}
                        >
                          {pengantaranItem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalGalonDiantar"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Total Galon Diantar</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="biayaPengantaran"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Biaya Pengantaran</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput readOnly className="bg-gray-50" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grandTotal"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Grand Total</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput readOnly className="bg-gray-50" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caraBayar"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Cara Bayar</FormLabel>
                <div className="w-48">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCaraBayar}
                  >
                    <FormControl>
                      <SelectTrigger className="w-48">
                        <SelectValue
                          placeholder={
                            isLoadingCaraBayar
                              ? "Loading..."
                              : "Pilih cara bayar"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {caraBayar?.data?.map((cara, index) => (
                        <SelectItem key={`cara-bayar-${index}`} value={cara}>
                          {cara}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nominalBayar"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Nominal Bayar</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput placeholder="Masukkan nominal" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kembalian"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Kembalian</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <NumberInput
                      readOnly
                      allowNegative
                      className="bg-gray-50"
                      {...field}
                    />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Remarks</FormLabel>
                <div className="w-48">
                  <FormControl>
                    <Textarea placeholder="Masukkan keterangan" {...field} />
                  </FormControl>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={addTransaksiMutation.isPending}
          >
            {addTransaksiMutation.isPending ? "Loading..." : "Input"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
