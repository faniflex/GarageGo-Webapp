import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GarageCard from "@/components/GarageCard";
import { garages as mockGarages } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Garage } from "@/data/mockData";

const Garages = () => {
  const [search, setSearch] = useState("");
  const [garageList, setGarageList] = useState<Garage[]>(mockGarages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGarages = async () => {
      const { data, error } = await supabase
        .from("garages")
        .select("*")
        .order("rating", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: Garage[] = data.map((g: any) => ({
          id: g.id,
          name: g.name,
          address: g.address,
          rating: Number(g.rating) || 0,
          reviewCount: g.review_count || 0,
          services: g.services || [],
          distance: "—",
          phone: g.phone || "",
          verified: g.verified || false,
          image: g.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
        }));
        setGarageList(mapped);
      }
      setLoading(false);
    };
    fetchGarages();
  }, []);

  const filtered = garageList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Find Garages</h1>
          <p className="text-muted-foreground">Browse verified garages and mechanics near you</p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or service..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No garages found matching "{search}"</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Garages;
