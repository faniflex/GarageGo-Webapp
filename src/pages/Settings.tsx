import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toggleTheme } from "@/lib/theme";
import { Sun, Moon, User as UserIcon, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const { user, loading, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <h1 className="text-2xl font-heading font-bold mb-4">Settings</h1>

        <div className="grid gap-4 max-w-md">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : user ? (
            <div className="bg-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{userRole ?? "User"}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <Button asChild>
                  <Link to="/profile">Manage Profile</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl p-4">
              <h2 className="font-medium mb-2">Get Started</h2>
              <p className="text-sm text-muted-foreground mb-3">Sign in or create an account to access dashboard features.</p>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
          <div className="bg-card rounded-xl p-4">
            <h2 className="font-medium mb-2">Appearance</h2>
            <p className="text-sm text-muted-foreground mb-3">Toggle light/dark theme for the app.</p>
            <Button variant="outline" onClick={handleToggleTheme}>
              {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />} Toggle Theme
            </Button>
          </div>

          <div className="bg-card rounded-xl p-4">
            <h2 className="font-medium mb-2">Account</h2>
            <p className="text-sm text-muted-foreground">Manage your account settings from your profile page.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
