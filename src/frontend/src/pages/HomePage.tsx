import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated Headline */}
          <div className="mb-12 space-y-2">
            <div className="animate-fade-slide-up opacity-0 [animation-delay:0ms]">
              <h1 className="text-6xl md:text-7xl font-bold text-primary">
                Rent.
              </h1>
            </div>
            <div className="animate-fade-slide-up opacity-0 [animation-delay:400ms]">
              <h1 className="text-6xl md:text-7xl font-bold">Use</h1>
            </div>
            <div className="animate-fade-slide-up opacity-0 [animation-delay:800ms]">
              <h1 className="text-6xl md:text-7xl font-bold text-primary">
                Return.
              </h1>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-slide-up opacity-0 [animation-delay:1200ms]">
            <Button
              size="lg"
              onClick={() => navigate({ to: "/add-rental" })}
              className="text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
              data-ocid="home.primary_button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Rental
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/search-rental" })}
              className="text-lg px-8 py-6 h-auto rounded-xl shadow-md hover:shadow-lg transition-all"
              data-ocid="home.secondary_button"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Rental
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
