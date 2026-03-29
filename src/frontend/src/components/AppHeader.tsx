import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  DollarSign,
  Gamepad2,
  Heart,
  History,
  LayoutDashboard,
  Menu,
  User,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUnreadNotificationCount } from "../hooks/useNotifications";
import { LoginButton } from "./LoginButton";

export function AppHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const unreadCount = useUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/generated/renteasy-logo.dim_512x512.png"
                alt="RentEasy"
                className="h-10 w-10"
              />
              <span className="text-xl font-semibold tracking-tight">
                RentEasy
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-sm font-medium hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/search-rental" })}
              className="text-sm font-medium hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/add-rental" })}
              className="text-sm font-medium hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Add Rental
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/owner-dashboard" })}
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-ocid="nav.link"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/owner-messages" })}
              className="text-sm font-medium hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/my-orders" })}
              className="text-sm font-medium hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              My Orders
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/favorites" })}
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-ocid="nav.link"
            >
              <Heart className="w-4 h-4" />
              Favorites
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/mini-game" })}
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              data-ocid="nav.link"
            >
              <Gamepad2 className="w-4 h-4" />
              Game
            </button>
            {identity && (
              <>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/negotiations" })}
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-ocid="nav.link"
                >
                  <DollarSign className="w-4 h-4" />
                  Negotiate
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/owner-profile" })}
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-ocid="nav.link"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/search-history" })}
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-ocid="nav.link"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/notifications" })}
                  className="relative text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  data-ocid="nav.link"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-[#1E88E5] text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}
            <LoginButton />
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {identity && (
              <button
                type="button"
                onClick={() => navigate({ to: "/notifications" })}
                className="relative p-1"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-[#1E88E5] text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/search-rental" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Search Rental
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/add-rental" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Add Rental
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/owner-dashboard" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-1"
              >
                <LayoutDashboard className="w-4 h-4" />
                Owner Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/owner-messages" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                Owner Messages
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/my-orders" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left"
              >
                My Orders
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/favorites" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-1"
              >
                <Heart className="w-4 h-4" />
                Favorites
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/mini-game" });
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Mini Game
              </button>
              {identity && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/negotiations" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Negotiations
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/owner-profile" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Owner Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/search-history" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    Search History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/notifications" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors text-left flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-[#1E88E5] text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
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
