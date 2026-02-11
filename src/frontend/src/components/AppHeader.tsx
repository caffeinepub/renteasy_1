import { useNavigate } from '@tanstack/react-router';
import { LoginButton } from './LoginButton';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function AppHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/renteasy-logo.dim_512x512.png"
                alt="RentEasy"
                className="h-10 w-10"
              />
              <span className="text-xl font-semibold tracking-tight">RentEasy</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate({ to: '/search-rental' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Search Rental
            </button>
            <button
              onClick={() => navigate({ to: '/add-rental' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Add Rental
            </button>
            <button
              onClick={() => navigate({ to: '/owner-messages' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Owner Messages
            </button>
            <button
              onClick={() => navigate({ to: '/my-orders' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              My Orders
            </button>
            <LoginButton />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => {
                  navigate({ to: '/' });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/search-rental' });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Search Rental
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/add-rental' });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Add Rental
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/owner-messages' });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Owner Messages
              </button>
              <button
                onClick={() => {
                  navigate({ to: '/my-orders' });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                My Orders
              </button>
              <div className="pt-2 border-t">
                <LoginButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
