import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, roundToDigits } from "@/lib/csv-export";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPayment: (received: number, change: number) => void;
}

export default function PaymentModal({ isOpen, onClose, total, onPayment }: PaymentModalProps) {
  const [received, setReceived] = useState<string>("");
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setReceived("");
      setChange(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const receivedAmount = parseFloat(received) || 0;
    const changeAmount = Math.max(0, receivedAmount - total);
    setChange(roundToDigits(changeAmount, 3));
  }, [received, total]);

  const handlePayment = () => {
    const receivedAmount = parseFloat(received) || 0;
    if (receivedAmount >= total) {
      onPayment(receivedAmount, change);
    }
  };

  const quickAmounts = [
    total,
    Math.ceil(total / 1000) * 1000, // Round up to nearest 1000
    Math.ceil(total / 5000) * 5000, // Round up to nearest 5000
    Math.ceil(total / 10000) * 10000, // Round up to nearest 10000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="text-center">Pembayaran Tunai</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary" data-testid="payment-total">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <Label htmlFor="received" className="block text-sm font-medium mb-2">
              Uang Diterima
            </Label>
            <Input
              id="received"
              type="number"
              className="w-full px-3 py-3 text-lg text-center"
              placeholder="0"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              data-testid="input-received"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => setReceived(amount.toString())}
                data-testid={`button-quick-${amount}`}
              >
                {formatCurrency(amount)}
              </Button>
            ))}
          </div>

          <div className="bg-material-surface-variant rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span>Kembalian:</span>
              <span className="text-xl font-bold text-accent" data-testid="payment-change">
                {formatCurrency(change)}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel-payment"
            >
              Batal
            </Button>
            <Button
              className="flex-1 btn-secondary"
              onClick={handlePayment}
              disabled={parseFloat(received) < total}
              data-testid="button-complete-payment"
            >
              Bayar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
