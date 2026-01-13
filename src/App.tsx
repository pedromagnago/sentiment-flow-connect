
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
import CompaniesPage from "./pages/CompaniesPage";
import ContactsPage from "./pages/ContactsPage";
import TeamPage from "./pages/TeamPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import ReceivablesPage from "./pages/ReceivablesPage";
import DREDashboardPage from "./pages/DREDashboardPage";
import BPOAuditPage from "./pages/BPOAuditPage";
import ImportPage from "./pages/ImportPage";
import BPODashboardPage from "./pages/BPODashboardPage";
import HelpPage from "./pages/HelpPage";
import { Settings } from "./components/Settings";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { WhatsAppLayout } from "./pages/whatsapp/WhatsAppLayout";
import { ChatsPage } from "./pages/whatsapp/ChatsPage";
import { QueuePage } from "./pages/whatsapp/QueuePage";
import { ContactsPage as WhatsAppContactsPage } from "./pages/whatsapp/ContactsPage";
import UnclassifiedPage from "./pages/whatsapp/UnclassifiedPage";
import StatusPage from "./pages/whatsapp/StatusPage";
import AllMessagesPage from "./pages/whatsapp/AllMessagesPage";
import AutoClassifyPage from "./pages/whatsapp/AutoClassifyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
            <SidebarProvider>
              <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* Main routes with layout */}
              <Route path="/" element={<ProtectedRoute><MainLayout><Index /></MainLayout></ProtectedRoute>} />
              <Route path="/payables" element={<ProtectedRoute><MainLayout><PayablesPage /></MainLayout></ProtectedRoute>} />
              <Route path="/receivables" element={<ProtectedRoute><MainLayout><ReceivablesPage /></MainLayout></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><MainLayout><InvoicesPage /></MainLayout></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><MainLayout><TasksPage /></MainLayout></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><MainLayout><AnalysisPage /></MainLayout></ProtectedRoute>} />
              <Route path="/suggested-actions" element={<ProtectedRoute><MainLayout><SuggestedActionsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><MainLayout><ReportsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/dre" element={<ProtectedRoute><MainLayout><DREDashboardPage /></MainLayout></ProtectedRoute>} />
              <Route path="/reconciliation" element={<ProtectedRoute><MainLayout><ReconciliationPage /></MainLayout></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MainLayout><AuditLogsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/companies" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MainLayout><CompaniesPage /></MainLayout></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><MainLayout><ContactsPage /></MainLayout></ProtectedRoute>} />
              
              {/* WhatsApp routes */}
              <Route path="/whatsapp" element={<ProtectedRoute allowedRoles={['operator', 'supervisor', 'admin', 'owner']}><WhatsAppLayout /></ProtectedRoute>}>
                <Route index element={<ChatsPage />} />
                <Route path="chats" element={<ChatsPage />} />
                <Route path="fila" element={<QueuePage />} />
                <Route path="contatos" element={<WhatsAppContactsPage />} />
                <Route path="nao-classificados" element={<UnclassifiedPage />} />
                <Route path="status" element={<StatusPage />} />
                <Route path="mensagens" element={<AllMessagesPage />} />
                <Route path="classificar" element={<AutoClassifyPage />} />
              </Route>
              
              {/* Team & BPO */}
              <Route path="/team" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MainLayout><TeamPage /></MainLayout></ProtectedRoute>} />
              <Route path="/bpo-audit" element={<ProtectedRoute allowedRoles={['operator', 'supervisor', 'admin', 'owner']}><MainLayout><BPOAuditPage /></MainLayout></ProtectedRoute>} />
              <Route path="/bpo-dashboard" element={<ProtectedRoute allowedRoles={['operator', 'supervisor', 'admin', 'owner']}><MainLayout><BPODashboardPage /></MainLayout></ProtectedRoute>} />
              <Route path="/import" element={<ProtectedRoute allowedRoles={['supervisor', 'admin', 'owner']}><MainLayout><ImportPage /></MainLayout></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><MainLayout><HelpPage /></MainLayout></ProtectedRoute>} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />
              
              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
