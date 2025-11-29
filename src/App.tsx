import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import SubcategoryPage from "./pages/SubcategoryPage";
import AllProductsPage from "./pages/AllProductsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrderStatusUpdatePage from "./pages/OrderStatusUpdatePage";
import ManagerDashboard from "./pages/ManagerDashboard";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <SearchProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route
                    path="/category/:categoryId"
                    element={<CategoryPage />}
                  />
                  <Route
                    path="/category/:categoryId/subcategory/:subcategoryId"
                    element={<SubcategoryPage />}
                  />
                  <Route
                    path="/category/:categoryId/all-products"
                    element={<AllProductsPage />}
                  />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-confirmation/:orderId"
                    element={<OrderConfirmationPage />}
                  />
                  <Route
                    path="/track-order/:orderId"
                    element={<OrderTrackingPage />}
                  />
                  <Route
                    path="/order/:orderId/start-processing"
                    element={<OrderStatusUpdatePage />}
                  />
                  <Route
                    path="/manager/dashboard"
                    element={<ManagerDashboard />}
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SearchProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
