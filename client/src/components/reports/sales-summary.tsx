import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/csv-export";

interface SalesSummaryProps {
  totalSales: number;
  totalTransactions: number;
  totalProfit: number;
  averageTransaction: number;
  showProfit?: boolean;
}

export default function SalesSummary({
  totalSales,
  totalTransactions,
  totalProfit,
  averageTransaction,
  showProfit = false,
}: SalesSummaryProps) {
  const summaryCards = [
    {
      id: "total-sales",
      label: "Total Penjualan",
      value: formatCurrency(totalSales),
      icon: "monetization_on",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: "total-transactions",
      label: "Total Transaksi",
      value: totalTransactions.toString(),
      icon: "receipt_long",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    ...(showProfit ? [{
      id: "total-profit",
      label: "Laba Kotor",
      value: formatCurrency(totalProfit),
      icon: "trending_up",
      color: "text-accent",
      bgColor: "bg-accent/10",
    }] : []),
    {
      id: "average-transaction",
      label: "Rata-rata/Transaksi",
      value: formatCurrency(averageTransaction),
      icon: "calculate",
      color: "text-on-surface",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className={`grid ${showProfit ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
        {summaryCards.map((card) => (
          <Card key={card.id} className="card-elevation">
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 rounded-full ${card.bgColor} flex items-center justify-center mx-auto mb-3`}>
                <span className={`material-icons ${card.color}`}>
                  {card.icon}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1" data-testid={`label-${card.id}`}>
                {card.label}
              </p>
              <p className={`text-xl font-bold ${card.color}`} data-testid={`value-${card.id}`}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="card-elevation">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Ringkasan Periode</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Penjualan:</span>
              <span className="font-medium" data-testid="summary-sales">
                {formatCurrency(totalSales)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaksi:</span>
              <span className="font-medium" data-testid="summary-transactions">
                {totalTransactions}
              </span>
            </div>
            {showProfit && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Laba:</span>
                  <span className="font-medium text-secondary" data-testid="summary-profit">
                    {formatCurrency(totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Margin:</span>
                  <span className="font-medium" data-testid="summary-margin">
                    {totalSales > 0 ? `${((totalProfit / totalSales) * 100).toFixed(1)}%` : "0%"}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between col-span-2">
              <span className="text-gray-600">Rata-rata per Transaksi:</span>
              <span className="font-medium" data-testid="summary-average">
                {formatCurrency(averageTransaction)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
