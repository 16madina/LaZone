import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Map from "./pages/Map";
import CreateListing from "./pages/CreateListing";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Stats from "./pages/Stats";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import { LocationProvider } from "./contexts/LocationContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LocationDetector from "./components/LocationDetector";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Check if splash has been shown before
  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <LocationProvider>
            <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <LocationDetector />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/map" element={<Map />} />
                    <Route 
                      path="/new" 
                      element={
                        <ProtectedRoute>
                          <CreateListing />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/favorites" 
                      element={
                        <ProtectedRoute>
                          <Favorites />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route 
                      path="/subscription" 
                      element={
                        <ProtectedRoute>
                          <Subscription />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </TooltipProvider>
            </LanguageProvider>
          </LocationProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;