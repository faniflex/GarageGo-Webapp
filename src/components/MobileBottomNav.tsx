import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, MapPin, ShoppingCart, Settings } from "lucide-react";

// Order: Home, Find Garages, Spare Parts, Message (Chat), Settings
const items = [
  { icon: Home, to: "/", label: "Home" },
  { icon: MapPin, to: "/garages", label: "Find Garages" },
  { icon: ShoppingCart, to: "/spare-parts", label: "Spare Parts" },
  { icon: MessageSquare, to: "/chat", label: "Messages" },
  { icon: Settings, to: "/settings", label: "Settings" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  // Hide bottom nav when a chat conversation is open (route /chat?id=...)
  try {
    const params = new URLSearchParams(location.search);
    if (location.pathname === "/chat" && params.has("id")) return null;
  } catch (e) {}

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
