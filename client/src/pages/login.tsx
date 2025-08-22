import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { loginSchema, type LoginRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "kasir",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${data.user.name}!`,
      });
      setLocation("/pos");
    },
    onError: (error) => {
      toast({
        title: "Login gagal",
        description: "Username atau password salah",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-sm card-elevation">
        <CardContent className="pt-6">
          {/* Store Logo */}
          <div className="text-center mb-8">
            <div className="bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons text-4xl text-gray-600">store</span>
            </div>
            <h1 className="text-2xl font-medium text-on-surface">TOKO SAYA</h1>
            <p className="text-sm text-gray-600 mt-1">Sistem Penjualan Mobile</p>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-on-surface mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                className="w-full"
                data-testid="input-username"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                className="w-full"
                data-testid="input-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-on-surface mb-2">
                Level User
              </Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value: "admin" | "kasir") => form.setValue("role", value)}
              >
                <SelectTrigger className="w-full" data-testid="select-role">
                  <SelectValue placeholder="Pilih level user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kasir">Kasir</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full btn-primary py-3 font-medium"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Masuk..." : "Masuk"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Kasir:</strong> kasir / kasir123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
