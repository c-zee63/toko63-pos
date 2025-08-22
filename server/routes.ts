import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertProductSchema, insertTransactionSchema, insertStoreSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      const user = await storage.validateLogin(username, password, role);
      
      if (user) {
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === "Product not found") {
        res.status(404).json({ message: "Product not found" });
      } else {
        res.status(400).json({ message: "Invalid product data" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (success) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else {
        transactions = await storage.getAllTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/held", async (req, res) => {
    try {
      const heldTransactions = await storage.getHeldTransactions();
      res.json(heldTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch held transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, transactionData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof Error && error.message === "Transaction not found") {
        res.status(404).json({ message: "Transaction not found" });
      } else {
        res.status(400).json({ message: "Invalid transaction data" });
      }
    }
  });

  // Store Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      if (settings) {
        res.json(settings);
      } else {
        res.status(404).json({ message: "Store settings not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch store settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertStoreSettingsSchema.parse(req.body);
      const settings = await storage.updateStoreSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Reports
  app.get("/api/reports/daily", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const transactions = await storage.getTransactionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );

      // Group transactions by date
      const dailyData = new Map();
      
      transactions.forEach(transaction => {
        const date = transaction.createdAt.toISOString().split('T')[0];
        
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date,
            totalSales: 0,
            totalTransactions: 0,
            totalProfit: 0,
            totalItems: 0,
            averageTransaction: 0,
          });
        }
        
        const dayData = dailyData.get(date);
        dayData.totalSales += transaction.total;
        dayData.totalTransactions += 1;
        dayData.totalProfit += transaction.totalProfit;
        dayData.totalItems += transaction.totalItems;
      });

      // Calculate averages
      dailyData.forEach(dayData => {
        dayData.averageTransaction = dayData.totalTransactions > 0 
          ? dayData.totalSales / dayData.totalTransactions 
          : 0;
      });

      const reports = Array.from(dailyData.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate reports" });
    }
  });

  // Export data for CSV
  app.get("/api/export/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="products.json"');
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  app.get("/api/export/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.json"');
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
