import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { UnclassifiedFilters as FilterType } from '@/hooks/useUnclassifiedFilters';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface UnclassifiedFiltersProps {
  filters: FilterType;
  onFilterChange: <K extends keyof FilterType>(key: K, value: FilterType[K]) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

export const UnclassifiedFilters = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount
}: UnclassifiedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="border-border/40">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type */}
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange('type', value as FilterType['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="groups">Apenas Grupos</SelectItem>
                  <SelectItem value="individuals">Apenas Individuais</SelectItem>
                </SelectContent>
              </Select>

              {/* Message Range */}
              <Select
                value={filters.messageRange}
                onValueChange={(value) => onFilterChange('messageRange', value as FilterType['messageRange'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mensagens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas quantidades</SelectItem>
                  <SelectItem value="0">Sem mensagens</SelectItem>
                  <SelectItem value="1-5">1-5 mensagens</SelectItem>
                  <SelectItem value="6-20">6-20 mensagens</SelectItem>
                  <SelectItem value="21-50">21-50 mensagens</SelectItem>
                  <SelectItem value="50+">50+ mensagens</SelectItem>
                </SelectContent>
              </Select>

              {/* Period */}
              <Select
                value={filters.period}
                onValueChange={(value) => onFilterChange('period', value as FilterType['period'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => onFilterChange('sortBy', value as FilterType['sortBy'])}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="messages_desc">Mais mensagens</SelectItem>
                    <SelectItem value="messages_asc">Menos mensagens</SelectItem>
                    <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                    <SelectItem value="recent">Mais recente</SelectItem>
                    <SelectItem value="oldest">Mais antigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
