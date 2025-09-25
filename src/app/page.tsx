import { Card, CardContent } from "@/components/ui/card";
import TransaksiForm from "@/components/shared/transaksi-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <div className="container mx-auto max-w-2xl">
        <main>
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent>
              <TransaksiForm />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
