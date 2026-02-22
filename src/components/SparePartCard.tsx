import { Link } from "react-router-dom";
import { Star, MapPin, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SparePart } from "@/data/mockData";

const SparePartCard = ({ part }: { part: SparePart }) => {
  return (
    <Link to={`/spare-parts/${part.id}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group block">
      <div className="relative h-32 md:h-44 overflow-hidden">
        <img
          src={part.image}
          alt={part.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <Badge
          className={`absolute top-3 right-3 ${
            part.condition === "New"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {part.condition}
        </Badge>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="font-heading font-semibold mb-1 leading-tight text-sm md:text-base">
          {part.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">{part.carModel}</p>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-heading font-bold text-primary">
            {part.price.toLocaleString()} ETB
          </p>
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-sm font-medium">{(part.rating ?? 0).toFixed ? (part.rating ?? 0).toFixed(1) : String(part.rating ?? 0)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-1">{part.seller}</p>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {part.location}
        </p>

        <Button size="sm" className="w-full">
          <ShoppingCart className="w-4 h-4" />
          Contact Seller
        </Button>
      </div>
    </Link>
  );
};

export default SparePartCard;
