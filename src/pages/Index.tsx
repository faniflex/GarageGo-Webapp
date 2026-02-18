import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import GarageCard from "@/components/GarageCard";
import SparePartCard from "@/components/SparePartCard";
import { garages, spareParts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* Top Garages Preview */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Top Rated Garages</h2>
              <p className="text-muted-foreground">Verified mechanics near you in Addis Ababa</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/garages">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {garages.slice(0, 3).map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/garages">View All Garages <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Spare Parts Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Latest Spare Parts</h2>
              <p className="text-muted-foreground">Genuine parts from trusted sellers</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/spare-parts">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spareParts.slice(0, 3).map((part) => (
              <SparePartCard key={part.id} part={part} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/spare-parts">View All Parts <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
