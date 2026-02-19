import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, BarChart2, Zap, Settings } from "lucide-react";

const items = [
  { icon: Home, to: "/", label: "Home" },
  { icon: MessageSquare, to: "/inbox", label: "Inbox" },
  { icon: BarChart2, to: "/dashboard", label: "Dashboard" },
  { icon: Zap, to: "/garages", label: "Find Garages" },
  { icon: Settings, to: "/profile", label: "Profile" },
];

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-lg">
      <div className="w-full bg-card/95 backdrop-blur-lg rounded-full px-3 py-2 shadow-lg border flex items-center justify-around">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-label={it.label}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
