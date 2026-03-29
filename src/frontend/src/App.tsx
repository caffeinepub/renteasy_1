import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import AddRentalPage from "./pages/AddRentalPage";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import MiniGamePage from "./pages/MiniGamePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import NegotiationsPage from "./pages/NegotiationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import OwnerMessagesPage from "./pages/OwnerMessagesPage";
import OwnerProfilePage from "./pages/OwnerProfilePage";
import SearchHistoryPage from "./pages/SearchHistoryPage";
import SearchRentalPage from "./pages/SearchRentalPage";

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
      aria-label="Scroll to top"
      data-ocid="app.button"
    >
      ↑
    </button>
  );
}

// Layout component that includes the header
function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ScrollToTop />
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground dark:text-white/70 mb-1">
            Crafted By ❤️ M.JASWANTH
          </p>
          <p className="text-xs text-muted-foreground dark:text-white/70 mb-4">
            Tested By 🚀 A.SIDDARDHA
          </p>
          <p className="text-xs text-muted-foreground dark:text-white/50">
            &copy; {new Date().getFullYear()} RentEasy. Built with love using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname || "renteasy-app",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const searchRentalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search-rental",
  component: SearchRentalPage,
});

const addRentalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-rental",
  component: AddRentalPage,
});

const ownerMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner-messages",
  component: OwnerMessagesPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-orders",
  component: MyOrdersPage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: FavoritesPage,
});

const ownerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner-dashboard",
  component: OwnerDashboardPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const ownerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner-profile",
  component: OwnerProfilePage,
});

const searchHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search-history",
  component: SearchHistoryPage,
});

const negotiationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/negotiations",
  component: NegotiationsPage,
});

const miniGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mini-game",
  component: MiniGamePage,
});

// Create router
const routeTree = rootRoute.addChildren([
  homeRoute,
  searchRentalRoute,
  addRentalRoute,
  ownerMessagesRoute,
  myOrdersRoute,
  favoritesRoute,
  ownerDashboardRoute,
  notificationsRoute,
  ownerProfileRoute,
  searchHistoryRoute,
  negotiationsRoute,
  miniGameRoute,
]);
const router = createRouter({ routeTree });

// Register router type for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
