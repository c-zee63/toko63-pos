import { Product, Transaction, DailyReport } from "@shared/schema";

export function exportProductsToCSV(products: Product[]): string {
  const headers = [
    'ID', 'Name', 'Description', 'Barcodes', 'Stock', 'Cost Price', 
    'Selling Price', 'Tier 1 Price', 'Tier 2 Price', 'Tier 3 Price',
    'Tier 1 Min', 'Tier 2 Min', 'Tier 3 Min', 'Active', 'Created At'
  ];

  const csvContent = [
    headers.join(','),
    ...products.map(product => [
      product.id,
      `"${product.name}"`,
      `"${product.description || ''}"`,
      `"${product.barcodes.join(';')}"`,
      product.stock,
      product.costPrice,
      product.sellingPrice,
      product.tier1Price,
      product.tier2Price,
      product.tier3Price,
      product.tier1Min,
      product.tier2Min,
      product.tier3Min,
      product.isActive,
      product.createdAt.toISOString()
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'ID', 'Total', 'Total Profit', 'Total Items', 'Payment Received', 
    'Change', 'Cashier Name', 'Status', 'Created At', 'Completed At', 'Items'
  ];

  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      transaction.id,
      transaction.total,
      transaction.totalProfit,
      transaction.totalItems,
      transaction.paymentReceived,
      transaction.change,
      `"${transaction.cashierName}"`,
      transaction.status,
      transaction.createdAt.toISOString(),
      transaction.completedAt?.toISOString() || '',
      `"${transaction.items.map(item => 
        `${item.productName}(${item.quantity}x${item.unitPrice})`
      ).join(';')}"`
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function exportReportsToCSV(reports: DailyReport[]): string {
  const headers = [
    'Date', 'Total Sales', 'Total Transactions', 'Total Profit', 
    'Total Items', 'Average Transaction'
  ];

  const csvContent = [
    headers.join(','),
    ...reports.map(report => [
      report.date,
      report.totalSales,
      report.totalTransactions,
      report.totalProfit,
      report.totalItems,
      report.averageTransaction.toFixed(2)
    ].join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
  return amount.toLocaleString();
}

export function roundToDigits(num: number, digits: number = 3): number {
  const factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;
}
