import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Phone, ShieldCheck, ArrowLeft, Loader2, Send } from "lucide-react";

interface GarageData {
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

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
}

const GarageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [garage, setGarage] = useState<GarageData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchGarage = async () => {
      const { data } = await supabase.from("garages").select("*").eq("id", id).single();

      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("garage_id", id)
        .order("created_at", { ascending: false });

      const reviewsArr = (revs as Review[]) || [];

      // Compute average rating and count from reviews to ensure accurate display
      const count = reviewsArr.length;
      const avg = count > 0 ? Number((reviewsArr.reduce((s, r) => s + (r.rating || 0), 0) / count).toFixed(1)) : 0;

      setGarage((prev) => ({
        ...(data as GarageData),
        rating: avg,
        review_count: count,
      } as GarageData));
      setReviews(reviewsArr);
      setLoading(false);
    };
    fetchGarage();
  }, [id]);

  const submitReview = async () => {
    if (!user || !id) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      garage_id: id,
      reviewer_id: user.id,
      rating: newRating,
      comment: newComment || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setNewComment("");
      setNewRating(0);
      // Refresh reviews
      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("garage_id", id)
        .order("created_at", { ascending: false });

      const reviewsArr = (revs as Review[]) || [];
      setReviews(reviewsArr);

      // Recompute aggregates and persist to garages table
      const count = reviewsArr.length;
      const avg = count > 0 ? Number((reviewsArr.reduce((s, r) => s + (r.rating || 0), 0) / count).toFixed(1)) : 0;

      await supabase.from("garages").update({ rating: avg, review_count: count }).eq("id", id);

      setGarage((prev) => (prev ? { ...prev, rating: avg, review_count: count } : prev));
    }
    setSubmitting(false);
  };

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

  if (!garage) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-20 text-center">
          <p className="text-lg text-muted-foreground">Garage not found.</p>
          <Button asChild className="mt-4"><Link to="/garages">Back to Garages</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <Link to="/garages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Garages
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden h-64 md:h-80">
              <img
                src={garage.image_url || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=400&fit=crop"}
                alt={garage.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-heading font-bold">{garage.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {garage.address}
                  </p>
                </div>
                {garage.verified && (
                  <Badge className="bg-primary text-primary-foreground">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{garage.rating || 0}</span>
                </div>
                <span className="text-sm text-muted-foreground">({garage.review_count || 0} reviews)</span>
              </div>

              {garage.description && (
                <p className="mt-4 text-muted-foreground leading-relaxed">{garage.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {(garage.services || []).map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-heading font-semibold mb-4">Reviews</h2>

              {user && (
                <div className="bg-card rounded-xl p-5 shadow-card mb-6 space-y-3">
                  <p className="font-medium text-sm">Leave a review</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setNewRating(n)} type="button">
                        <Star className={`w-6 h-6 transition-colors ${n <= newRating ? "text-accent fill-current" : "text-muted"}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                  />
                  <Button onClick={submitReview} disabled={submitting} size="sm">
                    <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-card rounded-xl p-4 shadow-card">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-accent fill-current" : "text-muted"}`} />
                        ))}
                      </div>
                      {r.comment && <p className="text-sm">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 shadow-card">
              <h3 className="font-heading font-semibold mb-3">Contact</h3>
              {garage.phone && (
                <a href={`tel:${garage.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> {garage.phone}
                </a>
              )}
                <div className="flex flex-col gap-2">
                  <Button className="w-full mt-2">
                    <Phone className="w-4 h-4" /> Call Now
                  </Button>
                  {user && garage && garage.owner_id && user.id !== garage.owner_id && (
                    <Button className="w-full mt-2" onClick={async () => {
                      // create or find conversation between current user and garage owner
                      const ownerId = garage.owner_id as string;
                      const pOne = user.id < ownerId ? user.id : ownerId;
                      const pTwo = user.id < ownerId ? ownerId : user.id;
                      // try to find existing
                      const { data: existing } = await supabase
                        .from("conversations")
                        .select("*")
                        .eq("participant_one", pOne)
                        .eq("participant_two", pTwo)
                        .eq("garage_id", id)
                        .limit(1);
                      if (existing && existing.length > 0) {
                        navigate(`/chat?cid=${existing[0].id}`);
                        return;
                      }
                      const { data, error } = await supabase.from("conversations").insert({ participant_one: pOne, participant_two: pTwo, garage_id: id }).select().single();
                      if (error) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                        return;
                      }
                      navigate(`/chat?cid=${(data as any).id}`);
                    }}>
                      <Send className="w-4 h-4" /> Message this Garage
                    </Button>
                  )}
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GarageDetail;
