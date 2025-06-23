
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthWrapper } from "@/components/AuthWrapper";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <AuthWrapper>
          <Routes>
            <Route path="*" element={<Index />} />
          </Routes>
        </AuthWrapper>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
