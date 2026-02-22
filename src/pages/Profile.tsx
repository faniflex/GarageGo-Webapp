import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Loader2, Save } from "lucide-react";

const Profile = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, location, bio })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleAvatarChange = async (file?: File) => {
    if (!user) return;
    const f = file;
    if (!f) return;

    try {
      const path = `${user.id}/${Date.now()}_${f.name}`;
      const { error: uploadError } = await supabase.storage.from("images").upload(path, f, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarChange(file);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10 max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-14 h-14 object-cover rounded-full" />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileInput} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-sm text-xs"
              aria-label="Change avatar"
            >
              Edit
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole || "User"}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9X XXX XXXX" />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Addis Ababa" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
