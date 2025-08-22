import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentPage: "pos" | "products" | "reports" | "settings";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    {
      id: "pos",
      label: "Kasir",
      icon: "point_of_sale",
      path: "/pos",
    },
    {
      id: "products",
      label: "Produk",
      icon: "inventory",
      path: "/products",
    },
    {
      id: "reports",
      label: "Laporan",
      icon: "analytics",
      path: "/reports",
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: "settings",
      path: "/settings",
    },
  ];

  const handleNavigation = (path: string, id: string) => {
    setLocation(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-material-outline">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-4 min-h-[60px] ${
                currentPage === item.id 
                  ? "text-primary" 
                  : "text-gray-600"
              }`}
              onClick={() => handleNavigation(item.path, item.id)}
              data-testid={`nav-${item.id}`}
            >
              <span className="material-icons text-base">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
