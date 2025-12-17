import { useMemo } from 'react';
import { useUserProfile } from './useUserProfile';

export type AppRole = 'owner' | 'admin' | 'supervisor' | 'operator' | 'viewer';

export interface Permissions {
  // Dashboard
  canViewDashboard: boolean;
  
  // Financial
  canViewPayables: boolean;
  canEditPayables: boolean;
  canViewReceivables: boolean;
  canEditReceivables: boolean;
  canViewInvoices: boolean;
  canEditInvoices: boolean;
  canViewReconciliation: boolean;
  canEditReconciliation: boolean;
  canViewDRE: boolean;
  canImportData: boolean;
  canRunBPOAudit: boolean;
  
  // Tasks
  canViewTasks: boolean;
  canEditTasks: boolean;
  
  // AI & Analysis
  canViewSuggestedActions: boolean;
  canApproveSuggestedActions: boolean;
  canViewReports: boolean;
  canViewAnalysis: boolean;
  
  // WhatsApp
  canViewWhatsApp: boolean;
  canSendMessages: boolean;
  canClassifyContacts: boolean;
  
  // Configuration
  canManageTeam: boolean;
  canManageCompanies: boolean;
  canViewAuditLogs: boolean;
  canEditSettings: boolean;
  
  // Help
  canViewHelp: boolean;
  
  // BPO Dashboard
  canViewBPODashboard: boolean;
}

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: AppRole[] = ['viewer', 'operator', 'supervisor', 'admin', 'owner'];

export function usePermissions() {
  const { roles, loading, isAdmin, isOwner } = useUserProfile();

  // Get highest role from all companies
  const highestRole = useMemo((): AppRole => {
    if (roles.length === 0) return 'viewer';
    
    let highest: AppRole = 'viewer';
    let highestIndex = 0;
    
    for (const role of roles) {
      const roleIndex = ROLE_HIERARCHY.indexOf(role.role as AppRole);
      if (roleIndex > highestIndex) {
        highestIndex = roleIndex;
        highest = role.role as AppRole;
      }
    }
    
    return highest;
  }, [roles]);

  // Check if user has at least a certain role level
  const hasMinRole = (minRole: AppRole): boolean => {
    const userIndex = ROLE_HIERARCHY.indexOf(highestRole);
    const minIndex = ROLE_HIERARCHY.indexOf(minRole);
    return userIndex >= minIndex;
  };

  // Check if user has specific role
  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role);
  };

  // Permission matrix based on role
  const permissions: Permissions = useMemo(() => {
    const isViewerOnly = highestRole === 'viewer';
    const isOperatorOrAbove = hasMinRole('operator');
    const isSupervisorOrAbove = hasMinRole('supervisor');
    const isAdminOrAbove = hasMinRole('admin');
    const isOwnerOnly = highestRole === 'owner';

    return {
      // Dashboard - everyone can view
      canViewDashboard: true,
      
      // Financial
      canViewPayables: true,
      canEditPayables: isOperatorOrAbove,
      canViewReceivables: true,
      canEditReceivables: isOperatorOrAbove,
      canViewInvoices: true,
      canEditInvoices: isOperatorOrAbove,
      canViewReconciliation: isOperatorOrAbove,
      canEditReconciliation: isOperatorOrAbove,
      canViewDRE: true,
      canImportData: isSupervisorOrAbove,
      canRunBPOAudit: isOperatorOrAbove,
      
      // Tasks
      canViewTasks: true,
      canEditTasks: isOperatorOrAbove,
      
      // AI & Analysis
      canViewSuggestedActions: true,
      canApproveSuggestedActions: isSupervisorOrAbove,
      canViewReports: true,
      canViewAnalysis: true,
      
      // WhatsApp
      canViewWhatsApp: isOperatorOrAbove,
      canSendMessages: isOperatorOrAbove,
      canClassifyContacts: isSupervisorOrAbove,
      
      // Configuration - only admin/owner
      canManageTeam: isAdminOrAbove,
      canManageCompanies: isAdminOrAbove,
      canViewAuditLogs: isAdminOrAbove,
      canEditSettings: isAdminOrAbove,
      
      // Help - everyone
      canViewHelp: true,
      
      // BPO Dashboard - operators and above (BPO team)
      canViewBPODashboard: isOperatorOrAbove,
    };
  }, [highestRole]);

  return {
    permissions,
    highestRole,
    hasMinRole,
    hasRole,
    loading,
    isAdmin,
    isOwner,
    roles,
  };
}

// Allowed roles for each route
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/payables': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/receivables': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/invoices': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/reconciliation': ['operator', 'supervisor', 'admin', 'owner'],
  '/import': ['supervisor', 'admin', 'owner'],
  '/dre': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/bpo-audit': ['operator', 'supervisor', 'admin', 'owner'],
  '/tasks': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/suggested-actions': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/reports': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/analysis': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/whatsapp': ['operator', 'supervisor', 'admin', 'owner'],
  '/team': ['admin', 'owner'],
  '/companies': ['admin', 'owner'],
  '/contacts': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/audit': ['admin', 'owner'],
  '/settings': ['admin', 'owner'],
  '/help': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
  '/bpo-dashboard': ['operator', 'supervisor', 'admin', 'owner'],
  '/onboarding': ['viewer', 'operator', 'supervisor', 'admin', 'owner'],
};
