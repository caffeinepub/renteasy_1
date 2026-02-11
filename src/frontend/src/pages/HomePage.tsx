import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to RentEasy</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your marketplace for renting items in your community
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate({ to: '/add-rental' })}
            className="text-lg px-8 py-6 h-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Rental
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: '/search-rental' })}
            className="text-lg px-8 py-6 h-auto"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Rental
          </Button>
        </div>
      </div>
    </div>
  );
}
