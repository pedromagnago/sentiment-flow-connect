import React from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CompanySwitcher() {
  const { 
    activeCompanyId, 
    availableCompanies, 
    setActiveCompany, 
    isAdmin,
    userRoles,
    loading 
  } = useCompanyContext();

  if (loading) {
    return <Skeleton className="h-10 w-64" />;
  }

  if (availableCompanies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Nenhuma empresa disponível</span>
      </div>
    );
  }

  // Se só tem 1 empresa, mostrar como badge fixo
  if (availableCompanies.length === 1 && !isAdmin) {
    const company = availableCompanies[0];
    const role = userRoles.get(company.id);
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{company.nome}</span>
        {role && (
          <Badge variant="secondary" className="text-xs">
            {role}
          </Badge>
        )}
      </div>
    );
  }

  const currentValue = activeCompanyId || 'all';
  
  return (
    <Select value={currentValue} onValueChange={(value) => {
      setActiveCompany(value === 'all' ? null : value);
    }}>
      <SelectTrigger className="w-64 bg-background/50 border-border/50">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {isAdmin && (
          <SelectItem value="all" className="font-medium">
            <div className="flex items-center gap-2">
              <span>Todas as Empresas</span>
              <Badge variant="outline" className="text-xs">
                Admin
              </Badge>
            </div>
          </SelectItem>
        )}
        {availableCompanies.map((company) => {
          const role = userRoles.get(company.id);
          const isActive = company.id === activeCompanyId;
          
          return (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center gap-2 w-full">
                <span className={isActive ? 'font-semibold' : ''}>
                  {company.nome}
                </span>
                {company.cnpj && (
                  <span className="text-xs text-muted-foreground">
                    {company.cnpj}
                  </span>
                )}
                {role && (
                  <Badge 
                    variant={role === 'owner' ? 'default' : 'secondary'} 
                    className="text-xs ml-auto"
                  >
                    {role}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
