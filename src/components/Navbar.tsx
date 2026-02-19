import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, LogOut, User, Sun, Moon, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Find Garages", path: "/garages" },
  { label: "Spare Parts", path: "/spare-parts" },
];

const Navbar = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return setUnread(0);
    let mounted = true;
    const fetchUnread = async () => {
      // fetch conversations for this user
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);
      const ids = (convs || []).map((c: any) => c.id);
      if (ids.length === 0) return mounted && setUnread(0);
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: false }).in("conversation_id", ids).eq("read", false).neq("sender_id", user.id);
      if (mounted) setUnread(count || 0);
    };
    fetchUnread();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl">
          <div className="w-9 h-9 rounded-lg bg-hero-gradient flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>Garage-Go</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleTheme();
              setIsDark(document.documentElement.classList.contains("dark"));
            }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Settings">
            <Link to="/settings">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/chat">Messages {unread > 0 && <span className="ml-1 text-xs">({unread})</span>}</Link>
              </Button>
              {userRole === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: top menu removed - bottom nav component provides navigation on small screens */}
      </div>
    </header>
  );
};

export default Navbar;
