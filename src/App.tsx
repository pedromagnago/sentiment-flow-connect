
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
import InvoicesPage from "./pages/InvoicesPage";
import TasksPage from "./pages/TasksPage";
import AnalysisPage from "./pages/AnalysisPage";
import SuggestedActionsPage from "./pages/SuggestedActionsPage";
import ReportsPage from "./pages/ReportsPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { PrivateRoute } from "./components/common/PrivateRoute";
import { MainLayout } from "./components/layout/MainLayout";
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
          <SidebarProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              
              {/* Main routes with layout */}
              <Route path="/" element={<PrivateRoute><MainLayout><Index /></MainLayout></PrivateRoute>} />
              <Route path="/payables" element={<PrivateRoute><MainLayout><PayablesPage /></MainLayout></PrivateRoute>} />
              <Route path="/invoices" element={<PrivateRoute><MainLayout><InvoicesPage /></MainLayout></PrivateRoute>} />
              <Route path="/tasks" element={<PrivateRoute><MainLayout><TasksPage /></MainLayout></PrivateRoute>} />
              <Route path="/analysis" element={<PrivateRoute><MainLayout><AnalysisPage /></MainLayout></PrivateRoute>} />
              <Route path="/suggested-actions" element={<PrivateRoute><MainLayout><SuggestedActionsPage /></MainLayout></PrivateRoute>} />
              <Route path="/reports" element={<PrivateRoute><MainLayout><ReportsPage /></MainLayout></PrivateRoute>} />
              <Route path="/reconciliation" element={<PrivateRoute><MainLayout><ReconciliationPage /></MainLayout></PrivateRoute>} />
              <Route path="/audit" element={<PrivateRoute><MainLayout><AuditLogsPage /></MainLayout></PrivateRoute>} />
              
              {/* WhatsApp routes */}
              <Route path="/whatsapp" element={<PrivateRoute><WhatsAppLayout /></PrivateRoute>}>
                <Route path="chats" element={<ChatsPage />} />
                <Route path="fila" element={<QueuePage />} />
                <Route path="contatos" element={<ContactsPage />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
