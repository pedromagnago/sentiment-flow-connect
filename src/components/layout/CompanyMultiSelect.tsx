import React, { useState, useMemo } from 'react';
import { useCompanyContext } from '@/contexts/CompanyContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, ChevronDown, Search, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CompanyMultiSelect() {
  const { 
    selectedCompanyIds, 
    availableCompanies, 
    setSelectedCompanies,
    selectAllCompanies,
    clearSelection,
    isAdmin,
    userRoles,
    loading,
    selectionMode
  } = useCompanyContext();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return availableCompanies;
    
    const query = searchQuery.toLowerCase();
    return availableCompanies.filter(company => 
      company.nome?.toLowerCase().includes(query) ||
      company.cnpj?.toLowerCase().includes(query)
    );
  }, [availableCompanies, searchQuery]);

  const handleToggleCompany = (companyId: string) => {
    if (selectedCompanyIds.includes(companyId)) {
      setSelectedCompanies(selectedCompanyIds.filter(id => id !== companyId));
    } else {
      setSelectedCompanies([...selectedCompanyIds, companyId]);
    }
  };

  const handleSelectAll = () => {
    selectAllCompanies();
    setOpen(false);
  };

  const handleClear = () => {
    clearSelection();
  };

  const handleApply = () => {
    setOpen(false);
  };

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

  // Se só tem 1 empresa e não é admin, mostrar como badge fixo
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

  const selectedCount = selectionMode === 'all' 
    ? availableCompanies.length 
    : selectedCompanyIds.length;

  const triggerText = selectionMode === 'all'
    ? 'Todas as Empresas'
    : selectedCount === 1
    ? availableCompanies.find(c => c.id === selectedCompanyIds[0])?.nome || 'Selecione'
    : `${selectedCount} empresas selecionadas`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-64 justify-between bg-background/50 border-border/50"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">{triggerText}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Select All (Admin only) */}
          {isAdmin && (
            <>
              <div className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={handleSelectAll}
              >
                <Checkbox 
                  checked={selectionMode === 'all'} 
                  onCheckedChange={handleSelectAll}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">Todas as Empresas</span>
                  <Badge variant="outline" className="text-xs">
                    Admin
                  </Badge>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Companies List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredCompanies.map((company) => {
                const role = userRoles.get(company.id);
                const isSelected = selectionMode === 'all' || selectedCompanyIds.includes(company.id);
                
                return (
                  <div
                    key={company.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => handleToggleCompany(company.id)}
                  >
                    <Checkbox 
                      checked={isSelected}
                      disabled={selectionMode === 'all'}
                      onCheckedChange={() => handleToggleCompany(company.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${isSelected ? 'font-semibold' : ''}`}>
                          {company.nome}
                        </span>
                        {role && (
                          <Badge 
                            variant={role === 'owner' ? 'default' : 'secondary'} 
                            className="text-xs flex-shrink-0"
                          >
                            {role}
                          </Badge>
                        )}
                      </div>
                      {company.cnpj && (
                        <span className="text-xs text-muted-foreground">
                          {company.cnpj}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Actions */}
          <Separator />
          <div className="flex items-center justify-between gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              disabled={selectedCompanyIds.length === 0}
            >
              Limpar
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply}
            >
              Aplicar ({selectedCount})
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
