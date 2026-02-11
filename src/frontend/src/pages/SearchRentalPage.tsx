import { useState } from 'react';
import { useSearchRentals } from '../hooks/useSearchRentals';
import { useRentals } from '../hooks/useRentals';
import { SearchRentalResultCard } from '../components/SearchRentalResultCard';
import { Search, Loader2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchRentalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use search hook when there's a query, otherwise use all rentals
  const { rentals: searchResults, isLoading: isSearching } = useSearchRentals(searchQuery);
  const { rentals: allRentals, isLoading: isLoadingAll } = useRentals();
  
  const rentals = searchQuery ? searchResults : allRentals;
  const isLoading = searchQuery ? isSearching : isLoadingAll;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Rentals</h1>
          <p className="text-muted-foreground">Find the perfect rental for your needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, category, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-6 text-base"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading rentals...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && rentals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No results found' : 'No rentals available'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to add a rental to the marketplace!'}
            </p>
          </div>
        )}

        {/* Rentals Grid */}
        {!isLoading && rentals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental, index) => (
              <SearchRentalResultCard key={`${rental.title}-${index}`} rental={rental} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
