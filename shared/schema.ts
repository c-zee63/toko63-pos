import { z } from "zod";

// User Management
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  role: z.enum(["admin", "kasir"]),
  name: z.string(),
  createdAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Product Management
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  barcodes: z.array(z.string()),
  stock: z.number().min(0),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  tier1Price: z.number().min(0), // 1-9 units
  tier2Price: z.number().min(0), // 10-24 units  
  tier3Price: z.number().min(0), // 25+ units
  tier1Min: z.number().default(1),
  tier2Min: z.number().default(10),
  tier3Min: z.number().default(25),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertProductSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Transaction Management
export const transactionItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  costPrice: z.number().min(0),
  profit: z.number(),
});

export const transactionSchema = z.object({
  id: z.string(),
  items: z.array(transactionItemSchema),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  totalProfit: z.number(),
  totalItems: z.number().min(0),
  paymentReceived: z.number().min(0),
  change: z.number().min(0),
  cashierId: z.string(),
  cashierName: z.string(),
  status: z.enum(["completed", "held"]),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export const insertTransactionSchema = transactionSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionItem = z.infer<typeof transactionItemSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Store Settings
export const storeSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  logo: z.string().optional(),
  theme: z.object({
    primary: z.string().default("#1976D2"),
    secondary: z.string().default("#388E3C"),
    accent: z.string().default("#FF9800"),
  }),
  currency: z.string().default("IDR"),
  roundingDigits: z.number().default(3),
  updatedAt: z.date(),
});

export const insertStoreSettingsSchema = storeSettingsSchema.omit({ 
  id: true, 
  updatedAt: true 
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;
export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;

// Reports
export const dailyReportSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  totalSales: z.number(),
  totalTransactions: z.number(),
  totalProfit: z.number(),
  totalItems: z.number(),
  averageTransaction: z.number(),
});

export type DailyReport = z.infer<typeof dailyReportSchema>;

// Authentication
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "kasir"]),
});

export type LoginRequest = z.infer<typeof loginSchema>;
