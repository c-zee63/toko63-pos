import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/csv-export";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onNewTransaction: () => void;
}

export default function ReceiptModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onNewTransaction 
}: ReceiptModalProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore event listeners
    }
  };

  const handleNewTransaction = () => {
    onNewTransaction();
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="text-center">Struk Pembayaran</DialogTitle>
        </DialogHeader>

        {/* Receipt */}
        <div 
          className="border border-gray-300 rounded-lg p-4 mb-4 text-sm bg-white" 
          id="printable-receipt"
        >
          <div className="text-center mb-4">
            <h3 className="font-bold" data-testid="receipt-store-name">TOKO SAYA</h3>
            <p data-testid="receipt-store-address">Jl. Contoh No. 123, Jakarta</p>
            <p data-testid="receipt-store-phone">Telp: 021-1234567</p>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-2">
            <div className="flex justify-between">
              <span>No. Transaksi:</span>
              <span data-testid="receipt-transaction-id">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span data-testid="receipt-date">
                {format(transaction.createdAt, 'dd/MM/yyyy HH:mm', { locale: id })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span data-testid="receipt-cashier">{transaction.cashierName}</span>
            </div>
          </div>

          <div className="space-y-1 mb-2">
            {transaction.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <span data-testid={`receipt-item-name-${index}`}>{item.productName}</span>
                  <span data-testid={`receipt-item-total-${index}`}>
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 ml-2">
                  <span data-testid={`receipt-item-quantity-${index}`}>{item.quantity}</span> x{' '}
                  <span data-testid={`receipt-item-price-${index}`}>
                    {formatCurrency(item.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span data-testid="receipt-total">{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span data-testid="receipt-paid">{formatCurrency(transaction.paymentReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembali:</span>
              <span data-testid="receipt-change">{formatCurrency(transaction.change)}</span>
            </div>
          </div>

          <div className="text-center mt-4 text-xs">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <span className="material-icons text-sm mr-1">print</span>
            Cetak
          </Button>
          <Button
            className="flex-1 btn-secondary"
            onClick={handleNewTransaction}
            data-testid="button-new-transaction"
          >
            Transaksi Baru
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
