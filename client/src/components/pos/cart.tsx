import { TransactionItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/csv-export";

interface CartProps {
  items: TransactionItem[];
  summary: {
    subtotal: number;
    totalItems: number;
    totalProfit: number;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProcessPayment: () => void;
  showProfit?: boolean;
}

export default function Cart({
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessPayment,
  showProfit = false,
}: CartProps) {
  return (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Keranjang Belanja</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
            onClick={() => alert("Hold transaction akan segera tersedia")}
            data-testid="button-hold"
          >
            <span className="material-icons text-sm mr-1">pause</span>
            Hold
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm"
            onClick={onClearCart}
            data-testid="button-clear-cart"
          >
            <span className="material-icons text-sm mr-1">clear</span>
            Clear
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-icons text-4xl mb-2">shopping_cart</span>
            <p>Keranjang masih kosong</p>
            <p className="text-sm">Cari dan pilih produk untuk memulai transaksi</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="card-elevation">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium" data-testid={`cart-item-name-${item.id}`}>
                      {item.productName}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <span className="material-icons text-sm">close</span>
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <span className="material-icons text-sm">remove</span>
                    </Button>
                    <span className="font-medium" data-testid={`cart-item-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <span className="material-icons text-sm">add</span>
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" data-testid={`cart-item-total-${item.id}`}>
                      {formatCurrency(item.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500" data-testid={`cart-item-unit-price-${item.id}`}>
                      @ {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>

                {showProfit && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Laba:</span>
                      <span className="text-secondary font-medium" data-testid={`cart-item-profit-${item.id}`}>
                        {formatCurrency(item.profit)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <Card className="card-elevation">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span data-testid="cart-subtotal">{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Item:</span>
                <span data-testid="cart-total-items">{summary.totalItems} item</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-secondary" data-testid="cart-total">
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>
              {showProfit && (
                <div className="text-sm text-gray-600 pt-1">
                  <span>Laba Kotor: </span>
                  <span className="text-secondary font-medium" data-testid="cart-total-profit">
                    {formatCurrency(summary.totalProfit)}
                  </span>
                </div>
              )}
            </div>

            <Button
              className="w-full mt-4 btn-secondary py-3 font-medium flex items-center justify-center space-x-2"
              onClick={onProcessPayment}
              disabled={items.length === 0}
              data-testid="button-process-payment"
            >
              <span className="material-icons">payment</span>
              <span>Proses Pembayaran</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
