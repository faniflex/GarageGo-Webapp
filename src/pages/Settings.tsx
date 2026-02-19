import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toggleTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

const Settings = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

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
      <Footer />
    </div>
  );
};

export default Settings;
