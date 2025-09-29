
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import PayablesPage from "./pages/PayablesPage";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/common/PrivateRoute";
import { WhatsAppLayout } from "./pages/whatsapp/WhatsAppLayout";
import { ChatsPage } from "./pages/whatsapp/ChatsPage";
import { QueuePage } from "./pages/whatsapp/QueuePage";
import { ContactsPage } from "./pages/whatsapp/ContactsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
            <Route path="/payables" element={<PrivateRoute><PayablesPage /></PrivateRoute>} />
            <Route path="/whatsapp" element={<PrivateRoute><WhatsAppLayout /></PrivateRoute>}>
              <Route path="chats" element={<ChatsPage />} />
              <Route path="fila" element={<QueuePage />} />
              <Route path="contatos" element={<ContactsPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
