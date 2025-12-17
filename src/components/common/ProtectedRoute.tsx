import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, ROUTE_PERMISSIONS, AppRole } from "@/hooks/usePermissions";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath = "/"
}) => {
  const { session, loading: authLoading } = useAuth();
  const { highestRole, loading: permLoading, roles } = usePermissions();
  const location = useLocation();

  // Still loading auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Still loading permissions
  if (permLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // Determine allowed roles
  const effectiveAllowedRoles = allowedRoles || ROUTE_PERMISSIONS[location.pathname] || ['owner'];

  // Check if user has access
  const hasAccess = effectiveAllowedRoles.includes(highestRole);

  // User has no roles at all - they need to complete onboarding or be invited
  if (roles.length === 0 && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // User doesn't have required role
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="border-destructive/50">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Acesso Negado</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                Você não tem permissão para acessar esta página.
              </p>
              <p className="text-sm opacity-80">
                Seu nível de acesso atual: <strong className="capitalize">{highestRole}</strong>
              </p>
              <p className="text-sm opacity-80">
                Níveis necessários: <strong className="capitalize">{effectiveAllowedRoles.join(', ')}</strong>
              </p>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.history.back()}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => window.location.href = fallbackPath}
                >
                  Ir para Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
