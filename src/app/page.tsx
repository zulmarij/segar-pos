import { Card, CardContent } from "@/components/ui/card";
import TransaksiForm from "@/components/shared/transaksi-form";

export default function Home() {
  return (
    <div className="flex flex-col ">
      <header className="flex flex-col justify-center items-center space-y-2 mt-4">
        <h1 className="text-2xl font-bold">Segar POS</h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border shadow-sm">
          <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
          <span className="text-sm font-medium text-foreground">
            Point of Sales V1.1
          </span>
        </div>
      </header>
      <main className="flex flex-1 flex-col justify-center items-center">
        <Card className="w-full max-w-lg shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <TransaksiForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
