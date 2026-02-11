import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { AppHeader } from './components/AppHeader';
import HomePage from './pages/HomePage';
import SearchRentalPage from './pages/SearchRentalPage';
import AddRentalPage from './pages/AddRentalPage';
import OwnerMessagesPage from './pages/OwnerMessagesPage';
import MyOrdersPage from './pages/MyOrdersPage';

// Layout component that includes the header
function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-muted/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} RentEasy. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname || 'renteasy-app'
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
  path: '/',
  component: HomePage,
});

const searchRentalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search-rental',
  component: SearchRentalPage,
});

const addRentalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-rental',
  component: AddRentalPage,
});

const ownerMessagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner-messages',
  component: OwnerMessagesPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-orders',
  component: MyOrdersPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  homeRoute,
  searchRentalRoute,
  addRentalRoute,
  ownerMessagesRoute,
  myOrdersRoute,
]);
const router = createRouter({ routeTree });

// Register router type for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
