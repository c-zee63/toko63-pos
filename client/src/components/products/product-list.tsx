import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/csv-export";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductList({ products, isLoading, onEdit, onDelete }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="card-elevation animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                  <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                </div>
                <div className="bg-gray-200 h-6 w-6 rounded"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div className="text-center py-8 text-gray-500">
          <span className="material-icons text-4xl mb-2">inventory</span>
          <p>Tidak ada produk ditemukan</p>
          <p className="text-sm">Tambahkan produk baru atau ubah kata kunci pencarian</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-3">
      {products.map((product) => (
        <Card key={product.id} className="card-elevation">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600" data-testid={`product-description-${product.id}`}>
                  {product.description || "Tidak ada deskripsi"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 text-gray-400"
                onClick={() => onEdit(product)}
                data-testid={`button-edit-${product.id}`}
              >
                <span className="material-icons">edit</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Kode:</span>
                <p className="font-medium" data-testid={`product-code-${product.id}`}>
                  {product.barcodes[0]}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Stok:</span>
                <p className="font-medium" data-testid={`product-stock-${product.id}`}>
                  {product.stock} unit
                </p>
              </div>
              <div>
                <span className="text-gray-600">Harga Jual:</span>
                <p className="font-medium text-secondary" data-testid={`product-selling-price-${product.id}`}>
                  {formatCurrency(product.sellingPrice)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Harga Modal:</span>
                <p className="font-medium" data-testid={`product-cost-price-${product.id}`}>
                  {formatCurrency(product.costPrice)}
                </p>
              </div>
            </div>

            {/* Tiered Pricing */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium mb-2">Harga Bertingkat:</p>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>1-{product.tier2Min - 1} unit:</span>
                  <span data-testid={`product-tier1-price-${product.id}`}>
                    {formatCurrency(product.tier1Price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{product.tier2Min}-{product.tier3Min - 1} unit:</span>
                  <span data-testid={`product-tier2-price-${product.id}`}>
                    {formatCurrency(product.tier2Price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{product.tier3Min}+ unit:</span>
                  <span data-testid={`product-tier3-price-${product.id}`}>
                    {formatCurrency(product.tier3Price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Multiple Barcodes */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium mb-2">Barcode:</p>
              <div className="flex flex-wrap gap-2">
                {product.barcodes.map((barcode, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded text-xs"
                    data-testid={`product-barcode-${product.id}-${index}`}
                  >
                    {barcode}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                data-testid={`button-edit-product-${product.id}`}
              >
                <span className="material-icons text-sm mr-1">edit</span>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => onDelete(product.id)}
                data-testid={`button-delete-product-${product.id}`}
              >
                <span className="material-icons text-sm mr-1">delete</span>
                Hapus
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
