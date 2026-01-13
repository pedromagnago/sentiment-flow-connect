import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { MessageFilters as MessageFiltersType } from '@/hooks/useAllMessages';

interface Company {
  id: string;
  nome: string | null;
}

interface MessageFiltersProps {
  filters: MessageFiltersType;
  updateFilter: <K extends keyof MessageFiltersType>(key: K, value: MessageFiltersType[K]) => void;
  resetFilters: () => void;
  companies: Company[];
  activeFiltersCount: number;
}

export const MessageFilters: React.FC<MessageFiltersProps> = ({
  filters,
  updateFilter,
  resetFilters,
  companies,
  activeFiltersCount
}) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mensagens..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Period */}
        <Select value={filters.period} onValueChange={(value: any) => updateFilter('period', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={filters.type} onValueChange={(value: any) => updateFilter('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="image">Imagem</SelectItem>
            <SelectItem value="document">Documento</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
          </SelectContent>
        </Select>

        {/* Classification */}
        <Select value={filters.classification} onValueChange={(value: any) => updateFilter('classification', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Classificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="classified">Classificados</SelectItem>
            <SelectItem value="unclassified">Não classificados</SelectItem>
          </SelectContent>
        </Select>

        {/* Direction */}
        <Select value={filters.direction} onValueChange={(value: any) => updateFilter('direction', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Direção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="received">Recebidas</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company filter */}
      <Select 
        value={filters.companyId || 'all'} 
        onValueChange={(value) => updateFilter('companyId', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full md:w-64">
          <SelectValue placeholder="Filtrar por empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.nome || 'Sem nome'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
