import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SparePartCard from "@/components/SparePartCard";
import { spareParts as mockParts } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SparePart } from "@/data/mockData";

const conditions = ["All", "New", "Used"] as const;

const SpareParts = () => {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<string>("All");
  const [partsList, setPartsList] = useState<SparePart[]>(mockParts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      const { data, error } = await supabase
        .from("spare_parts")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: SparePart[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          seller: "Seller",
          location: p.location || "Addis Ababa",
          condition: p.condition as "New" | "Used",
          carModel: p.car_model || "Universal",
          image: p.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
          rating: Number(p.rating) || 0,
        }));
        setPartsList(mapped);
      }
      setLoading(false);
    };
    fetchParts();
  }, []);

  const filtered = partsList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.carModel.toLowerCase().includes(search.toLowerCase());
    const matchCondition = condition === "All" || p.condition === condition;
    return matchSearch && matchCondition;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Spare Parts Marketplace</h1>
          <p className="text-muted-foreground">Browse genuine spare parts from trusted sellers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search parts or car model..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {conditions.map((c) => (
              <Button key={c} size="sm" variant={condition === c ? "default" : "outline"} onClick={() => setCondition(c)}>
                {c}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((part) => (
              <SparePartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No parts found matching your criteria</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SpareParts;
