import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ProductSearch from "@/components/pos/product-search";
import Cart from "@/components/pos/cart";
import PaymentModal from "@/components/pos/payment-modal";
import ReceiptModal from "@/components/pos/receipt-modal";
import { Product, TransactionItem, Transaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function POSPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const calculateTieredPrice = (product: Product, quantity: number): number => {
    if (quantity >= product.tier3Min) {
      return product.tier3Price;
    } else if (quantity >= product.tier2Min) {
      return product.tier2Price;
    } else {
      return product.tier1Price;
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const unitPrice = calculateTieredPrice(product, quantity);
    const totalPrice = unitPrice * quantity;
    const profit = (unitPrice - product.costPrice) * quantity;

    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const newUnitPrice = calculateTieredPrice(product, newQuantity);
      const newTotalPrice = newUnitPrice * newQuantity;
      const newProfit = (newUnitPrice - product.costPrice) * newQuantity;

      setCartItems(items => items.map(item =>
        item.productId === product.id
          ? {
              ...item,
              quantity: newQuantity,
              unitPrice: newUnitPrice,
              totalPrice: newTotalPrice,
              profit: newProfit,
            }
          : item
      ));
    } else {
      const newItem: TransactionItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice,
        costPrice: product.costPrice,
        profit,
      };
      setCartItems(items => [...items, newItem]);
    }

    toast({
      title: "Produk ditambahkan",
      description: `${product.name} (${quantity} unit) berhasil ditambahkan ke keranjang`,
    });
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(items => items.map(item => {
      if (item.id === itemId) {
        const newTotalPrice = item.unitPrice * newQuantity;
        const newProfit = (item.unitPrice - item.costPrice) * newQuantity;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          profit: newProfit,
        };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Keranjang dibersihkan",
      description: "Semua item telah dihapus dari keranjang",
    });
  };

  const handlePayment = (paymentReceived: number, change: number) => {
    if (!user) return;

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalProfit = cartItems.reduce((sum, item) => sum + item.profit, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const transaction: Transaction = {
      id: `TRX${Date.now()}`,
      items: cartItems,
      subtotal,
      total: subtotal,
      totalProfit,
      totalItems,
      paymentReceived,
      change,
      cashierId: user.id,
      cashierName: user.name,
      status: "completed",
      createdAt: new Date(),
      completedAt: new Date(),
    };

    setCurrentTransaction(transaction);
    setShowPaymentModal(false);
    setShowReceiptModal(true);
    
    // Save transaction to localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('pos_transactions') || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem('pos_transactions', JSON.stringify(existingTransactions));
  };

  const startNewTransaction = () => {
    setCartItems([]);
    setCurrentTransaction(null);
    setShowReceiptModal(false);
  };

  const cartSummary = {
    subtotal: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalProfit: cartItems.reduce((sum, item) => sum + item.profit, 0),
  };

  return (
    <div className="min-h-screen bg-material-background">
      {/* Top App Bar */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="material-icons">store</span>
          <div>
            <h1 className="font-medium" data-testid="text-store-name">TOKO SAYA</h1>
            <p className="text-xs opacity-80" data-testid="text-cashier-name">
              Kasir: {user?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs" data-testid="text-current-date">
            {new Date().toLocaleDateString('id-ID')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            onClick={logout}
            data-testid="button-logout"
          >
            <span className="material-icons">logout</span>
          </Button>
        </div>
      </header>

      <div className="mobile-safe-area">
        {/* Product Search */}
        <ProductSearch onAddToCart={addToCart} />

        {/* Cart */}
        <Cart
          items={cartItems}
          summary={cartSummary}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onProcessPayment={() => setShowPaymentModal(true)}
          showProfit={user?.role === "admin"}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="pos" />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={cartSummary.subtotal}
        onPayment={handlePayment}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        transaction={currentTransaction}
        onNewTransaction={startNewTransaction}
      />
    </div>
  );
}
