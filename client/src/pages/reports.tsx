import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DailyReport, Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/layout/bottom-navigation";
import SalesSummary from "@/components/reports/sales-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportReportsToCSV, downloadCSV, formatCurrency } from "@/lib/csv-export";

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/reports/daily", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports/daily?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return await response.json() as DailyReport[];
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return await response.json() as Transaction[];
    },
  });

  const handleExportReport = () => {
    if (reports.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const csvContent = exportReportsToCSV(reports);
    const filename = `laporan-penjualan-${startDate}-${endDate}.csv`;
    downloadCSV(csvContent, filename);
  };

  const totals = reports.reduce(
    (acc, report) => ({
      totalSales: acc.totalSales + report.totalSales,
      totalTransactions: acc.totalTransactions + report.totalTransactions,
      totalProfit: acc.totalProfit + report.totalProfit,
      totalItems: acc.totalItems + report.totalItems,
    }),
    { totalSales: 0, totalTransactions: 0, totalProfit: 0, totalItems: 0 }
  );

  const averageTransaction = totals.totalTransactions > 0 
    ? totals.totalSales / totals.totalTransactions 
    : 0;

  // Top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  transactions.forEach(transaction => {
    transaction.items.forEach(item => {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
      } else {
        productSales.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.totalPrice,
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-material-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setLocation("/pos")}
            data-testid="button-back"
          >
            <span className="material-icons">arrow_back</span>
          </Button>
          <h1 className="font-medium text-lg">Laporan Penjualan</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20"
          onClick={handleExportReport}
          data-testid="button-export"
        >
          <span className="material-icons">file_download</span>
        </Button>
      </header>

      <div className="mobile-safe-area">
        {/* Date Filter */}
        <div className="p-4 bg-surface">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Label htmlFor="startDate" className="block text-sm font-medium mb-1">
                Dari Tanggal
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                data-testid="input-start-date"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="block text-sm font-medium mb-1">
                Sampai Tanggal
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                data-testid="input-end-date"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SalesSummary
          totalSales={totals.totalSales}
          totalTransactions={totals.totalTransactions}
          totalProfit={totals.totalProfit}
          averageTransaction={averageTransaction}
          showProfit={isAdmin}
        />

        {/* Daily Sales Chart */}
        <div className="p-4">
          <Card className="card-elevation">
            <CardHeader>
              <CardTitle>Penjualan Harian</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="bg-gray-200 h-4 w-16 rounded"></div>
                        <div className="bg-gray-200 h-2 flex-1 mx-3 rounded"></div>
                        <div className="bg-gray-200 h-4 w-20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-icons text-4xl mb-2">analytics</span>
                  <p>Tidak ada data penjualan</p>
                  <p className="text-sm">Pilih rentang tanggal yang berbeda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report, index) => {
                    const maxSales = Math.max(...reports.map(r => r.totalSales));
                    const percentage = maxSales > 0 ? (report.totalSales / maxSales) * 100 : 0;
                    
                    return (
                      <div key={report.date} className="flex items-center justify-between">
                        <span className="text-sm w-20" data-testid={`text-date-${index}`}>
                          {format(new Date(report.date), 'dd/MM')}
                        </span>
                        <div className="flex-1 mx-3">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-24 text-right" data-testid={`text-sales-${index}`}>
                          {formatCurrency(report.totalSales)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <div className="p-4">
          <Card className="card-elevation">
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-icons text-4xl mb-2">inventory</span>
                  <p>Tidak ada data produk</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={`${product.name}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium" data-testid={`text-product-name-${index}`}>
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`text-product-quantity-${index}`}>
                            {product.quantity} unit terjual
                          </p>
                        </div>
                      </div>
                      <span className="font-medium" data-testid={`text-product-revenue-${index}`}>
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="reports" />
    </div>
  );
}
