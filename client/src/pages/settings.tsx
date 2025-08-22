import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function Settings() {
  const { user, logout } = useAuth();
  const [appInfo] = useState({
    version: "1.0.0",
    buildDate: "August 2025",
    developer: "Toko63 Team"
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const clearLocalData = () => {
    if (confirm("Yakin ingin menghapus semua data lokal? Data yang belum di-sync akan hilang.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="mobile-container pb-20">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-on-background mb-2">
            Pengaturan
          </h1>
          <p className="text-sm text-on-background/70">
            Kelola aplikasi dan akun Anda
          </p>
        </div>

        {/* User Info Card */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-on-background">
                {user?.username}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                  {user?.role === "admin" ? "Administrator" : "Kasir"}
                </Badge>
              </div>
            </div>
            <span className="material-icons text-2xl text-primary">
              account_circle
            </span>
          </div>
        </Card>

        {/* Settings Options */}
        <div className="space-y-3">
          {/* Data Management */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-on-background">
              Data & Sinkronisasi
            </h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left"
                onClick={clearLocalData}
                data-testid="button-clear-data"
              >
                <span className="material-icons mr-2">delete_sweep</span>
                Hapus Data Lokal
              </Button>
            </div>
          </Card>

          {/* App Settings */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-on-background">
              Aplikasi
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-background/70">Mode Offline</span>
                <Badge variant="secondary">Aktif</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-background/70">Auto Backup</span>
                <Badge variant="secondary">Aktif</Badge>
              </div>
            </div>
          </Card>

          {/* App Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-on-background">
              Informasi Aplikasi
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-background/70">Versi</span>
                <span className="text-on-background">{appInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-background/70">Build Date</span>
                <span className="text-on-background">{appInfo.buildDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-background/70">Developer</span>
                <span className="text-on-background">{appInfo.developer}</span>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <Card className="p-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <span className="material-icons mr-2">logout</span>
              Keluar
            </Button>
          </Card>
        </div>
      </div>

      <BottomNavigation currentPage="settings" />
    </div>
  );
}