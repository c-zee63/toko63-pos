import { Product, Transaction, StoreSettings, User } from "@shared/schema";

class POSStorage {
  private readonly keys = {
    products: 'pos_products',
    transactions: 'pos_transactions',
    settings: 'pos_settings',
    user: 'pos_current_user',
    heldTransactions: 'pos_held_transactions'
  };

  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(this.keys.products);
    return data ? JSON.parse(data) : [];
  }

  saveProducts(products: Product[]): void {
    localStorage.setItem(this.keys.products, JSON.stringify(products));
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      this.saveProducts(products);
    }
  }

  // Transactions
  getTransactions(): Transaction[] {
    const data = localStorage.getItem(this.keys.transactions);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'createdAt' || key === 'completedAt') {
        return value ? new Date(value) : value;
      }
      return value;
    }) : [];
  }

  saveTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(this.keys.transactions, JSON.stringify(transactions));
  }

  // Held Transactions
  getHeldTransactions(): Transaction[] {
    const data = localStorage.getItem(this.keys.heldTransactions);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'createdAt' || key === 'completedAt') {
        return value ? new Date(value) : value;
      }
      return value;
    }) : [];
  }

  saveHeldTransaction(transaction: Transaction): void {
    const held = this.getHeldTransactions();
    held.push(transaction);
    localStorage.setItem(this.keys.heldTransactions, JSON.stringify(held));
  }

  removeHeldTransaction(id: string): void {
    const held = this.getHeldTransactions();
    const filtered = held.filter(t => t.id !== id);
    localStorage.setItem(this.keys.heldTransactions, JSON.stringify(filtered));
  }

  // Settings
  getSettings(): StoreSettings | null {
    const data = localStorage.getItem(this.keys.settings);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'updatedAt') {
        return new Date(value);
      }
      return value;
    }) : null;
  }

  saveSettings(settings: StoreSettings): void {
    localStorage.setItem(this.keys.settings, JSON.stringify(settings));
  }

  // User
  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.keys.user);
    return data ? JSON.parse(data, (key, value) => {
      if (key === 'createdAt') {
        return new Date(value);
      }
      return value;
    }) : null;
  }

  saveCurrentUser(user: User): void {
    localStorage.setItem(this.keys.user, JSON.stringify(user));
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.keys.user);
  }

  // Utilities
  exportData() {
    return {
      products: this.getProducts(),
      transactions: this.getTransactions(),
      settings: this.getSettings(),
      heldTransactions: this.getHeldTransactions()
    };
  }

  importData(data: any): void {
    if (data.products) this.saveProducts(data.products);
    if (data.transactions) {
      localStorage.setItem(this.keys.transactions, JSON.stringify(data.transactions));
    }
    if (data.settings) this.saveSettings(data.settings);
    if (data.heldTransactions) {
      localStorage.setItem(this.keys.heldTransactions, JSON.stringify(data.heldTransactions));
    }
  }

  clearAllData(): void {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const posStorage = new POSStorage();
