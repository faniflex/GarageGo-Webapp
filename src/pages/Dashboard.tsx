import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import uploadImage from "@/integrations/supabase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Package, Wrench, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GarageRow {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  services: string[] | null;
  description: string | null;
  image_url: string | null;
  verified: boolean | null;
  rating: number | null;
  review_count: number | null;
}

interface SparePartRow {
  id: string;
  name: string;
  price: number;
  condition: string;
  car_model: string | null;
  category: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  available: boolean | null;
}

const Dashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [garages, setGarages] = useState<GarageRow[]>([]);
  const [parts, setParts] = useState<SparePartRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Garage form
  const [garageDialogOpen, setGarageDialogOpen] = useState(false);
  const [editingGarage, setEditingGarage] = useState<GarageRow | null>(null);
  const [gForm, setGForm] = useState({ name: "", address: "", phone: "", services: "", description: "" });
  const [gImageFile, setGImageFile] = useState<File | null>(null);
  const [gImagePreview, setGImagePreview] = useState<string | null>(null);

  // Part form
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePartRow | null>(null);
  const [pForm, setPForm] = useState({ name: "", price: "", condition: "New", car_model: "", category: "", location: "", description: "" });
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [pImagePreview, setPImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    if (userRole === "mechanic" || userRole === "admin") {
      const { data } = await supabase.from("garages").select("*").eq("owner_id", user!.id);
      setGarages((data as GarageRow[]) || []);
    }
    if (userRole === "seller" || userRole === "admin") {
      const { data } = await supabase.from("spare_parts").select("*").eq("seller_id", user!.id);
      setParts((data as SparePartRow[]) || []);
    }
    setLoading(false);
  };

  // Garage CRUD
  const openGarageDialog = (garage?: GarageRow) => {
    if (garage) {
      setEditingGarage(garage);
      setGForm({
        name: garage.name,
        address: garage.address,
        phone: garage.phone || "",
        services: (garage.services || []).join(", "),
        description: garage.description || "",
      });
      setGImageFile(null);
      setGImagePreview(garage.image_url || null);
    } else {
      setEditingGarage(null);
      setGForm({ name: "", address: "", phone: "", services: "", description: "" });
      setGImageFile(null);
      setGImagePreview(null);
    }
    setGarageDialogOpen(true);
  };

  const saveGarage = async () => {
    if (!gForm.name || !gForm.address) return;
    setSubmitting(true);
    const payload = {
      name: gForm.name,
      address: gForm.address,
      phone: gForm.phone || null,
      services: gForm.services.split(",").map((s) => s.trim()).filter(Boolean),
      description: gForm.description || null,
      owner_id: user!.id,
    };

    // Upload image if provided
    try {
      if (gImageFile) {
        const url = await uploadImage(gImageFile);
        // attach image_url to payload
        // @ts-ignore
        payload.image_url = url;
      }
    } catch (err: any) {
      toast({ title: "Image upload failed", description: err.message || String(err), variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (editingGarage) {
      const { error } = await supabase.from("garages").update(payload).eq("id", editingGarage.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Garage updated!" });
    } else {
      const { error } = await supabase.from("garages").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Garage added!" });
    }
    setSubmitting(false);
    setGarageDialogOpen(false);
    setGImageFile(null);
    setGImagePreview(null);
    fetchData();
  };

  const deleteGarage = async (id: string) => {
    const { error } = await supabase.from("garages").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Garage deleted" }); fetchData(); }
  };

  // Part CRUD
  const openPartDialog = (part?: SparePartRow) => {
    if (part) {
      setEditingPart(part);
      setPForm({
        name: part.name,
        price: String(part.price),
        condition: part.condition,
        car_model: part.car_model || "",
        category: part.category || "",
        location: part.location || "",
        description: part.description || "",
      });
      setPImageFile(null);
      setPImagePreview(part.image_url || null);
    } else {
      setEditingPart(null);
      setPForm({ name: "", price: "", condition: "New", car_model: "", category: "", location: "", description: "" });
      setPImageFile(null);
      setPImagePreview(null);
    }
    setPartDialogOpen(true);
  };

  const savePart = async () => {
    if (!pForm.name || !pForm.price) return;
    setSubmitting(true);
    const payload = {
      name: pForm.name,
      price: Number(pForm.price),
      condition: pForm.condition,
      car_model: pForm.car_model || null,
      category: pForm.category || null,
      location: pForm.location || null,
      description: pForm.description || null,
      seller_id: user!.id,
    };

    // Upload image if provided
    try {
      if (pImageFile) {
        const url = await uploadImage(pImageFile);
        // @ts-ignore
        payload.image_url = url;
      }
    } catch (err: any) {
      toast({ title: "Image upload failed", description: err.message || String(err), variant: "destructive" });
      setSubmitting(false);
      return;
    }

    if (editingPart) {
      const { error } = await supabase.from("spare_parts").update(payload).eq("id", editingPart.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Part updated!" });
    } else {
      const { error } = await supabase.from("spare_parts").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Part listed!" });
    }
    setSubmitting(false);
    setPartDialogOpen(false);
    setPImageFile(null);
    setPImagePreview(null);
    fetchData();
  };

  const deletePart = async (id: string) => {
    const { error } = await supabase.from("spare_parts").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Part deleted" }); fetchData(); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage your {userRole === "mechanic" ? "garages" : userRole === "seller" ? "spare parts" : "listings"}
        </p>

        {/* Mechanic: Garages */}
        {(userRole === "mechanic" || userRole === "admin") && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> My Garages
              </h2>
              <Dialog open={garageDialogOpen} onOpenChange={setGarageDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => openGarageDialog()}>
                    <Plus className="w-4 h-4" /> Add Garage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingGarage ? "Edit Garage" : "Add New Garage"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} placeholder="Garage name" />
                    </div>
                    <div>
                      <Label>Address *</Label>
                      <Input value={gForm.address} onChange={(e) => setGForm({ ...gForm, address: e.target.value })} placeholder="Full address" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={gForm.phone} onChange={(e) => setGForm({ ...gForm, phone: e.target.value })} placeholder="+251 9X XXX XXXX" />
                    </div>
                    <div>
                      <Label>Services (comma-separated)</Label>
                      <Input value={gForm.services} onChange={(e) => setGForm({ ...gForm, services: e.target.value })} placeholder="Oil Change, Brake Repair, ..." />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={gForm.description} onChange={(e) => setGForm({ ...gForm, description: e.target.value })} placeholder="Describe your garage..." />
                    </div>
                    <div>
                      <Label>Image</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setGImageFile(f);
                          setGImagePreview(f ? URL.createObjectURL(f) : null);
                        }}
                        className="w-full"
                      />
                      {gImagePreview && (
                        <img src={gImagePreview} alt="preview" className="mt-2 h-32 w-full object-cover rounded" />
                      )}
                    </div>
                    <Button onClick={saveGarage} disabled={submitting} className="w-full">
                      {submitting ? "Saving..." : editingGarage ? "Update Garage" : "Create Garage"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => <div key={i} className="bg-card rounded-xl h-32 animate-pulse" />)}
              </div>
            ) : garages.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center text-muted-foreground">
                <Wrench className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No garages yet. Add your first garage to get started!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {garages.map((g) => (
                  <div key={g.id} className="bg-card rounded-xl p-5 shadow-card flex justify-between items-start">
                    <div>
                      <h3 className="font-heading font-semibold">{g.name}</h3>
                      <p className="text-sm text-muted-foreground">{g.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(g.services || []).join(", ")}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openGarageDialog(g)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteGarage(g.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Seller: Spare Parts */}
        {(userRole === "seller" || userRole === "admin") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> My Parts
              </h2>
              <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => openPartDialog()}>
                    <Plus className="w-4 h-4" /> List Part
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPart ? "Edit Part" : "List New Part"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} placeholder="Part name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price (ETB) *</Label>
                        <Input type="number" value={pForm.price} onChange={(e) => setPForm({ ...pForm, price: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <Label>Condition</Label>
                        <select
                          value={pForm.condition}
                          onChange={(e) => setPForm({ ...pForm, condition: e.target.value })}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="New">New</option>
                          <option value="Used">Used</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Car Model</Label>
                      <Input value={pForm.car_model} onChange={(e) => setPForm({ ...pForm, car_model: e.target.value })} placeholder="e.g. Toyota Corolla 2015-2020" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Input value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })} placeholder="e.g. Brakes" />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={pForm.location} onChange={(e) => setPForm({ ...pForm, location: e.target.value })} placeholder="e.g. Bole, Addis Ababa" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={pForm.description} onChange={(e) => setPForm({ ...pForm, description: e.target.value })} placeholder="Describe this part..." />
                    </div>
                    <div>
                      <Label>Image</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setPImageFile(f);
                          setPImagePreview(f ? URL.createObjectURL(f) : null);
                        }}
                        className="w-full"
                      />
                      {pImagePreview && (
                        <img src={pImagePreview} alt="preview" className="mt-2 h-32 w-full object-cover rounded" />
                      )}
                    </div>
                    <Button onClick={savePart} disabled={submitting} className="w-full">
                      {submitting ? "Saving..." : editingPart ? "Update Part" : "List Part"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => <div key={i} className="bg-card rounded-xl h-32 animate-pulse" />)}
              </div>
            ) : parts.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No parts listed yet. Add your first spare part!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {parts.map((p) => (
                  <div key={p.id} className="bg-card rounded-xl p-5 shadow-card flex justify-between items-start">
                    <div>
                      <h3 className="font-heading font-semibold">{p.name}</h3>
                      <p className="text-sm font-bold text-primary">{Number(p.price).toLocaleString()} ETB</p>
                      <p className="text-xs text-muted-foreground">{p.condition} · {p.car_model}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openPartDialog(p)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePart(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {userRole === "car_owner" && (
          <div className="bg-card rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Welcome to your dashboard!</p>
            <p>As a car owner, you can browse garages and spare parts from the navigation above.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
