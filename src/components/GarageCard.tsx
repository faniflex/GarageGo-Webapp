import { Link } from "react-router-dom";
import { MapPin, Star, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Garage } from "@/data/mockData";

const GarageCard = ({ garage }: { garage: Garage }) => {
  return (
    <Link to={`/garages/${garage.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group block">
      <div className="relative h-48 overflow-hidden">
        <img
          src={garage.image}
          alt={garage.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {garage.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3 text-accent" />
          {garage.distance}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-heading font-semibold text-lg leading-tight">
            {garage.name}
          </h3>
          <div className="flex items-center gap-1 text-accent shrink-0">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{(garage.rating ?? 0).toFixed ? (garage.rating ?? 0).toFixed(1) : String(garage.rating ?? 0)}</span>
            <span className="text-xs text-muted-foreground">({garage.reviewCount ?? 0})</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {garage.address}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {garage.services.map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Phone className="w-4 h-4" />
            Contact
          </Button>
          <Button size="sm" variant="outline">
            <MapPin className="w-4 h-4" />
            Directions
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default GarageCard;
