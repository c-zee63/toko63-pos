import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/csv-export";

interface ProductFormProps {
  product?: Product;
  onSave: (productData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ product, onSave, onCancel, isLoading }: ProductFormProps) {
  const form = useForm<any>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      barcodes: product?.barcodes || [""],
      stock: product?.stock || 0,
      costPrice: product?.costPrice || 0,
      sellingPrice: product?.sellingPrice || 0,
      tier1Price: product?.tier1Price || 0,
      tier2Price: product?.tier2Price || 0,
      tier3Price: product?.tier3Price || 0,
      tier1Min: product?.tier1Min || 1,
      tier2Min: product?.tier2Min || 10,
      tier3Min: product?.tier3Min || 25,
      isActive: product?.isActive !== undefined ? product.isActive : true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "barcodes" as const,
  });

  const onSubmit = (data: any) => {
    // Filter out empty barcodes
    const filteredData = {
      ...data,
      barcodes: data.barcodes.filter((barcode: string) => barcode.trim() !== ""),
    };
    onSave(filteredData);
  };

  const addBarcode = () => {
    append("");
  };

  const removeBarcode = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Auto-fill tiered prices based on selling price
  const handleSellingPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    form.setValue("sellingPrice", price);
    
    // If tiered prices are not set or are 0, auto-fill with reasonable defaults
    if (!form.getValues("tier1Price") || form.getValues("tier1Price") === 0) {
      form.setValue("tier1Price", price);
    }
    if (!form.getValues("tier2Price") || form.getValues("tier2Price") === 0) {
      form.setValue("tier2Price", Math.round(price * 0.9)); // 10% discount
    }
    if (!form.getValues("tier3Price") || form.getValues("tier3Price") === 0) {
      form.setValue("tier3Price", Math.round(price * 0.8)); // 20% discount
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Information */}
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-2">
          Nama Produk *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Masukkan nama produk"
          className="w-full"
          data-testid="input-product-name"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {String(form.formState.errors.name.message)}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-2">
          Deskripsi
        </Label>
        <Textarea
          id="description"
          placeholder="Deskripsi produk (opsional)"
          className="w-full"
          rows={3}
          data-testid="input-product-description"
          {...form.register("description")}
        />
      </div>

      {/* Barcodes */}
      <div>
        <Label className="block text-sm font-medium mb-2">
          Barcode *
        </Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Masukkan barcode"
                className="flex-1"
                data-testid={`input-barcode-${index}`}
                {...form.register(`barcodes.${index}`)}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-3"
                  onClick={() => removeBarcode(index)}
                  data-testid={`button-remove-barcode-${index}`}
                >
                  <span className="material-icons text-sm">delete</span>
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addBarcode}
            data-testid="button-add-barcode"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Tambah Barcode
          </Button>
        </div>
        {form.formState.errors.barcodes && (
          <p className="text-sm text-destructive mt-1">
            Minimal satu barcode harus diisi
          </p>
        )}
      </div>

      {/* Stock and Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock" className="block text-sm font-medium mb-2">
            Stok *
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="0"
            className="w-full"
            data-testid="input-product-stock"
            {...form.register("stock", { valueAsNumber: true })}
          />
          {form.formState.errors.stock && (
            <p className="text-sm text-destructive mt-1">
              {String(form.formState.errors.stock.message)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="costPrice" className="block text-sm font-medium mb-2">
            Harga Modal *
          </Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className="w-full"
            data-testid="input-product-cost-price"
            {...form.register("costPrice", { valueAsNumber: true })}
          />
          {form.formState.errors.costPrice && (
            <p className="text-sm text-destructive mt-1">
              {String(form.formState.errors.costPrice.message)}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="sellingPrice" className="block text-sm font-medium mb-2">
          Harga Jual *
        </Label>
        <Input
          id="sellingPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          className="w-full"
          data-testid="input-product-selling-price"
          {...form.register("sellingPrice", { 
            valueAsNumber: true,
            onChange: (e) => handleSellingPriceChange(e.target.value)
          })}
        />
        {form.formState.errors.sellingPrice && (
          <p className="text-sm text-destructive mt-1">
            {String(form.formState.errors.sellingPrice.message)}
          </p>
        )}
      </div>

      {/* Tiered Pricing */}
      <div className="bg-material-surface-variant rounded-lg p-4">
        <h3 className="font-medium mb-3">Harga Bertingkat</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier1Min" className="block text-sm font-medium mb-1">
                Min Tier 1
              </Label>
              <Input
                id="tier1Min"
                type="number"
                min="1"
                className="w-full"
                data-testid="input-tier1-min"
                {...form.register("tier1Min", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="tier1Price" className="block text-sm font-medium mb-1">
                Harga Tier 1
              </Label>
              <Input
                id="tier1Price"
                type="number"
                min="0"
                step="0.01"
                className="w-full"
                data-testid="input-tier1-price"
                {...form.register("tier1Price", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier2Min" className="block text-sm font-medium mb-1">
                Min Tier 2
              </Label>
              <Input
                id="tier2Min"
                type="number"
                min="1"
                className="w-full"
                data-testid="input-tier2-min"
                {...form.register("tier2Min", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="tier2Price" className="block text-sm font-medium mb-1">
                Harga Tier 2
              </Label>
              <Input
                id="tier2Price"
                type="number"
                min="0"
                step="0.01"
                className="w-full"
                data-testid="input-tier2-price"
                {...form.register("tier2Price", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier3Min" className="block text-sm font-medium mb-1">
                Min Tier 3
              </Label>
              <Input
                id="tier3Min"
                type="number"
                min="1"
                className="w-full"
                data-testid="input-tier3-min"
                {...form.register("tier3Min", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="tier3Price" className="block text-sm font-medium mb-1">
                Harga Tier 3
              </Label>
              <Input
                id="tier3Price"
                type="number"
                min="0"
                step="0.01"
                className="w-full"
                data-testid="input-tier3-price"
                {...form.register("tier3Price", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
          <p className="font-medium mb-1">Contoh Harga:</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>1-{(form.watch("tier2Min") || 10) - 1} unit:</span>
              <span>{formatCurrency(form.watch("tier1Price") || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{form.watch("tier2Min") || 10}-{(form.watch("tier3Min") || 25) - 1} unit:</span>
              <span>{formatCurrency(form.watch("tier2Price") || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{form.watch("tier3Min") || 25}+ unit:</span>
              <span>{formatCurrency(form.watch("tier3Price") || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="button-cancel-product"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 btn-primary"
          disabled={isLoading}
          data-testid="button-save-product"
        >
          {isLoading ? "Menyimpan..." : product ? "Perbarui" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
