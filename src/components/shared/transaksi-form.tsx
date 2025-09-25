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
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Gift,
  Calculator,
  CreditCard,
  Truck,
  Receipt,
  RotateCcw,
  Send,
} from "lucide-react";

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
        toast.dismiss();
        toast.success("Transaksi berhasil ditambahkan!");
        handleClear();
      },
      onError: (error) => {
        toast.dismiss();
        toast.error(`Gagal menambah transaksi: ${error.message}`);
      },
    });
  };

  const handleClear = () => {
    form.reset(defaultTransaksiFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Produk Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Produk</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="jumlahGalon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Jumlah Galon
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingJumlahGalon}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue
                          placeholder={
                            isLoadingJumlahGalon ? "Loading..." : "Pilih jumlah"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Total Harga
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Promo Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-chart-2" />
            <h3 className="text-sm font-medium text-foreground">Promo</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="promo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Jenis Promo
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPromo}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="freeIsiGalon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Free Galon
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="totalGalon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Total Galon
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diskonBundling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Diskon
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pengantaran Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-chart-3" />
            <h3 className="text-sm font-medium text-foreground">Pengantaran</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="pengantaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Antar?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingPengantaran}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalGalonDiantar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Galon Diantar
                  </FormLabel>
                  <FormControl>
                    <NumberInput className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Perhitungan Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-chart-4" />
            <h3 className="text-sm font-medium text-foreground">Perhitungan</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="subTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Sub Total
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="biayaPengantaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Biaya Antar
                  </FormLabel>
                  <FormControl>
                    <NumberInput
                      readOnly
                      className="bg-muted h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="grandTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Grand Total
                </FormLabel>
                <FormControl>
                  <NumberInput
                    readOnly
                    className="bg-primary/10 border-primary/20 h-10 font-semibold"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pembayaran Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-chart-5" />
            <h3 className="text-sm font-medium text-foreground">Pembayaran</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="caraBayar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Metode
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCaraBayar}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nominalBayar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    Nominal
                  </FormLabel>
                  <FormControl>
                    <NumberInput placeholder="0" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="kembalian"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Kembalian
                </FormLabel>
                <FormControl>
                  <NumberInput
                    readOnly
                    allowNegative
                    className="bg-muted h-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Catatan Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Catatan</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan keterangan tambahan..."
                    className="resize-none h-16"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <Separator className="my-4" />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 h-10"
            onClick={handleClear}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1 h-10"
            disabled={addTransaksiMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {addTransaksiMutation.isPending ? "Memproses..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
