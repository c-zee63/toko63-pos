import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/csv-export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ProductSearchProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/products/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return await response.json() as Product[];
    },
    enabled: searchQuery.length > 0,
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQuantityDialog(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      onAddToCart(selectedProduct, quantity);
      setShowQuantityDialog(false);
      setSelectedProduct(null);
      setSearchQuery("");
    }
  };

  const getTieredPrice = (product: Product, qty: number) => {
    if (qty >= product.tier3Min) {
      return product.tier3Price;
    } else if (qty >= product.tier2Min) {
      return product.tier2Price;
    } else {
      return product.tier1Price;
    }
  };

  return (
    <>
      <div className="p-4 bg-surface">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            search
          </span>
          <Input
            type="text"
            className="w-full pl-10 pr-12 py-3"
            placeholder="Cari produk berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-product-search"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
            onClick={() => alert("Barcode scanner akan segera tersedia")}
            data-testid="button-barcode-scanner"
          >
            <span className="material-icons text-gray-400">qr_code_scanner</span>
          </Button>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mt-4 space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-material-surface-variant rounded-lg p-3 border animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                        <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                        <div className="bg-gray-200 h-3 w-1/3 rounded"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-200 h-4 w-16 rounded"></div>
                        <div className="bg-gray-200 h-3 w-12 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="material-icons text-4xl mb-2">search_off</span>
                <p>Produk tidak ditemukan</p>
                <p className="text-sm">Coba kata kunci yang berbeda</p>
              </div>
            ) : (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  className="bg-material-surface-variant rounded-lg p-3 border border-material-outline cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleProductSelect(product)}
                  data-testid={`product-result-${product.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-on-surface" data-testid={`product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600" data-testid={`product-code-${product.id}`}>
                        Kode: {product.barcodes[0]}
                      </p>
                      <p className="text-sm text-gray-600" data-testid={`product-stock-${product.id}`}>
                        Stok: {product.stock} unit
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-secondary" data-testid={`product-price-${product.id}`}>
                        {formatCurrency(product.sellingPrice)}
                      </p>
                      {product.tier2Price !== product.sellingPrice && (
                        <p className="text-xs text-gray-500" data-testid={`product-tiered-price-${product.id}`}>
                          Grosir: {formatCurrency(product.tier2Price)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quantity Selection Dialog */}
      <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
        <DialogContent className="w-full max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Pilih Jumlah</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium" data-testid="selected-product-name">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Stok tersedia: {selectedProduct.stock} unit
                </p>
              </div>

              <div>
                <Label htmlFor="quantity" className="block text-sm font-medium mb-2">
                  Jumlah
                </Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    <span className="material-icons text-sm">remove</span>
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    data-testid="input-quantity"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10"
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    data-testid="button-increase-quantity"
                  >
                    <span className="material-icons text-sm">add</span>
                  </Button>
                </div>
              </div>

              <div className="bg-material-surface-variant rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span>Harga per unit:</span>
                  <span className="font-medium" data-testid="price-per-unit">
                    {formatCurrency(getTieredPrice(selectedProduct, quantity))}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span className="text-secondary" data-testid="total-price">
                    {formatCurrency(getTieredPrice(selectedProduct, quantity) * quantity)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowQuantityDialog(false)}
                  data-testid="button-cancel"
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 btn-primary"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  Tambah ke Keranjang
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
