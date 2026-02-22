import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { spareParts as mockParts, type SparePart } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";

const SparePartDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [part, setPart] = useState<SparePart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPart = async () => {
      // Try fetching from supabase, fallback to mock data
      try {
        const { data, error } = await supabase.from("spare_parts").select("*").eq("id", id).single();
        if (!error && data) {
          const mapped: SparePart = {
            id: data.id,
            name: data.name,
            price: Number(data.price) || 0,
            seller: data.seller || "Seller",
            location: data.location || "Addis Ababa",
            condition: (data.condition as "New" | "Used") || "New",
            carModel: data.car_model || "Universal",
            image: data.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop",
            rating: Number(data.rating) || 0,
          };
          setPart(mapped);
        } else {
          const fallback = mockParts.find((p) => p.id === id) || null;
          setPart(fallback);
        }
      } catch (e) {
        const fallback = mockParts.find((p) => p.id === id) || null;
        setPart(fallback);
      }
      setLoading(false);
    };
    fetchPart();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Spare part not found.</p>
          <Button asChild className="mt-4"><Link to="/spare-parts">Back to Spare Parts</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <Link to="/spare-parts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Spare Parts
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden h-64 md:h-80">
              <img src={part.image} alt={part.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold">{part.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {part.location}
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">{part.condition}</Badge>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{part.rating || 0}</span>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground leading-relaxed">Model: {part.carModel}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 shadow-card">
              <h3 className="font-heading font-semibold mb-3">Details</h3>
              <p className="text-lg font-semibold text-primary mb-2">{part.price.toLocaleString()} ETB</p>
              <p className="text-sm text-muted-foreground mb-1">Seller: {part.seller}</p>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {part.location}</p>

              <Button className="w-full mt-4">
                <ShoppingCart className="w-4 h-4" /> Contact Seller
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SparePartDetail;
