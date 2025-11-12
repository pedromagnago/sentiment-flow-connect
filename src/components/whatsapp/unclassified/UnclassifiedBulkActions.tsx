import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, Users2, User, Activity, X, Download } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';
import { Company } from '@/hooks/useCompanies';

interface UnclassifiedBulkActionsProps {
  selectedContacts: Set<string>;
  contacts: Contact[];
  messageCount: Record<string, number>;
  companies: Company[];
  bulkCompanyId: string;
  onSelectAll: () => void;
  onSelectByType: (type: 'groups' | 'individuals') => void;
  onSelectByActivity: (type: 'active' | 'inactive') => void;
  onClearSelection: () => void;
  onCompanyChange: (companyId: string) => void;
  onBulkClassify: () => void;
  onExport: () => void;
  loadingCompanies: boolean;
}

export const UnclassifiedBulkActions = ({
  selectedContacts,
  contacts,
  messageCount,
  companies,
  bulkCompanyId,
  onSelectAll,
  onSelectByType,
  onSelectByActivity,
  onClearSelection,
  onCompanyChange,
  onBulkClassify,
  onExport,
  loadingCompanies
}: UnclassifiedBulkActionsProps) => {
  const groupCount = contacts.filter(c => c.is_group).length;
  const individualCount = contacts.filter(c => !c.is_group).length;
  const activeCount = contacts.filter(c => (messageCount[c.id_contact] || 0) >= 5).length;
  const inactiveCount = contacts.filter(c => (messageCount[c.id_contact] || 0) === 0).length;

  const allSelected = selectedContacts.size === contacts.length && contacts.length > 0;

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
      <div className="flex flex-col gap-4">
        {/* Selection Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <Badge variant="secondary" className="text-sm">
              {selectedContacts.size} selecionado{selectedContacts.size !== 1 && 's'}
            </Badge>
          </div>

          {selectedContacts.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Desmarcar Todos
            </Button>
          )}
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Seleção rápida:</span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectByType('groups')}
            disabled={groupCount === 0}
          >
            <Users2 className="w-4 h-4 mr-2" />
            Grupos ({groupCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectByType('individuals')}
            disabled={individualCount === 0}
          >
            <User className="w-4 h-4 mr-2" />
            Individuais ({individualCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectByActivity('active')}
            disabled={activeCount === 0}
          >
            <Activity className="w-4 h-4 mr-2" />
            Ativos 5+ msgs ({activeCount})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectByActivity('inactive')}
            disabled={inactiveCount === 0}
          >
            <Square className="w-4 h-4 mr-2" />
            Sem mensagens ({inactiveCount})
          </Button>
        </div>

        {/* Classification Actions */}
        {selectedContacts.size > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-border/40">
            <Select value={bulkCompanyId} onValueChange={onCompanyChange}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Selecionar empresa..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.nome || company.cnpj || 'Empresa sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={onBulkClassify}
                disabled={!bulkCompanyId || loadingCompanies}
                className="flex-1 sm:flex-none"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Classificar ({selectedContacts.size})
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={onExport}
                title="Exportar selecionados"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
