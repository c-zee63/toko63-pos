import { type User, type InsertUser, type Product, type InsertProduct, type Transaction, type InsertTransaction, type StoreSettings, type InsertStoreSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateLogin(username: string, password: string, role: string): Promise<User | null>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  getHeldTransactions(): Promise<Transaction[]>;
  
  // Store Settings
  getStoreSettings(): Promise<StoreSettings | undefined>;
  updateStoreSettings(settings: InsertStoreSettings): Promise<StoreSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private transactions: Map<string, Transaction>;
  private storeSettings: StoreSettings | undefined;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminId = randomUUID();
    const admin: User = {
      id: adminId,
      username: "admin",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      name: "Administrator",
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create default kasir user
    const kasirId = randomUUID();
    const kasir: User = {
      id: kasirId,
      username: "kasir",
      password: "kasir123", // In production, this should be hashed
      role: "kasir",
      name: "Kasir",
      createdAt: new Date(),
    };
    this.users.set(kasirId, kasir);

    // Create default store settings
    this.storeSettings = {
      id: randomUUID(),
      name: "TOKO SAYA",
      address: "Jl. Contoh No. 123, Jakarta",
      phone: "021-1234567",
      theme: {
        primary: "#1976D2",
        secondary: "#388E3C",
        accent: "#FF9800",
      },
      currency: "IDR",
      roundingDigits: 3,
      updatedAt: new Date(),
    };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async validateLogin(username: string, password: string, role: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password && user.role === role) {
      return user;
    }
    return null;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      product => product.barcodes.includes(barcode) && product.isActive
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) {
      throw new Error("Product not found");
    }
    const updated: Product = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (product) {
      product.isActive = false;
      product.updatedAt = new Date();
      this.products.set(id, product);
      return true;
    }
    return false;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.isActive && (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.barcodes.some(barcode => barcode.includes(query)) ||
        (product.description && product.description.toLowerCase().includes(lowerQuery))
      )
    );
  }

  // Transaction methods
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => 
      transaction.createdAt >= startDate && 
      transaction.createdAt <= endDate &&
      transaction.status === "completed"
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction> {
    const existing = this.transactions.get(id);
    if (!existing) {
      throw new Error("Transaction not found");
    }
    const updated: Transaction = { ...existing, ...updateData };
    this.transactions.set(id, updated);
    return updated;
  }

  async getHeldTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.status === "held");
  }

  // Store Settings methods
  async getStoreSettings(): Promise<StoreSettings | undefined> {
    return this.storeSettings;
  }

  async updateStoreSettings(settings: InsertStoreSettings): Promise<StoreSettings> {
    if (!this.storeSettings) {
      throw new Error("Store settings not initialized");
    }
    this.storeSettings = {
      ...this.storeSettings,
      ...settings,
      updatedAt: new Date(),
    };
    return this.storeSettings;
  }
}

export const storage = new MemStorage();
