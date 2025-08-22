import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ProductList from "@/components/products/product-list";
import ProductForm from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProductsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return await response.json() as Product[];
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductForm(false);
      setEditingProduct(undefined);
      toast({
        title: "Produk berhasil disimpan",
        description: "Produk baru telah ditambahkan ke daftar",
      });
    },
    onError: () => {
      toast({
        title: "Gagal menyimpan produk",
        description: "Terjadi kesalahan saat menyimpan produk",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductForm(false);
      setEditingProduct(undefined);
      toast({
        title: "Produk berhasil diperbarui",
        description: "Perubahan telah disimpan",
      });
    },
    onError: () => {
      toast({
        title: "Gagal memperbarui produk",
        description: "Terjadi kesalahan saat memperbarui produk",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produk berhasil dihapus",
        description: "Produk telah dihapus dari daftar",
      });
    },
    onError: () => {
      toast({
        title: "Gagal menghapus produk",
        description: "Terjadi kesalahan saat menghapus produk",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcodes.some(barcode => barcode.includes(searchQuery))
  );

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

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
          <h1 className="font-medium text-lg">Manajemen Produk</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20"
          onClick={handleAddProduct}
          data-testid="button-add-product"
        >
          <span className="material-icons">add</span>
        </Button>
      </header>

      <div className="mobile-safe-area">
        {/* Search */}
        <div className="p-4 bg-surface">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <Input
              type="text"
              className="w-full pl-10 pr-4 py-3"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-product-search"
            />
          </div>
        </div>

        {/* Product List */}
        <ProductList
          products={filteredProducts}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="products" />

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 btn-secondary rounded-full shadow-lg"
        onClick={handleAddProduct}
        data-testid="fab-add-product"
      >
        <span className="material-icons">add</span>
      </Button>

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="w-full max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setShowProductForm(false)}
            isLoading={createProductMutation.isPending || updateProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
