import React, { useState, useMemo } from 'react';
import { useCategories, Category } from '@/hooks/useCategories';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, Search, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryPickerProps {
  value?: string | null;
  onChange: (categoryId: string | null, categoryName: string | null) => void;
  placeholder?: string;
  filterType?: 'receita' | 'despesa' | 'ativo' | 'passivo' | 'all';
  disabled?: boolean;
  className?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecionar categoria',
  filterType = 'all',
  disabled = false,
  className
}) => {
  const { flatCategories, findCategoryById, loading } = useCategories();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCategory = value ? findCategoryById(value) : null;

  const filteredCategories = useMemo(() => {
    let cats = flatCategories;
    
    // Filter by type
    if (filterType !== 'all') {
      cats = cats.filter(c => c.tipo === filterType);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      cats = cats.filter(c => 
        c.nome.toLowerCase().includes(searchLower) ||
        c.codigo.toLowerCase().includes(searchLower) ||
        c.path.toLowerCase().includes(searchLower)
      );
    }

    return cats;
  }, [flatCategories, filterType, search]);

  const handleSelect = (category: Category & { path: string }) => {
    onChange(category.id, category.path);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null, null);
    setOpen(false);
    setSearch('');
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'receita': return 'text-green-600';
      case 'despesa': return 'text-red-600';
      case 'ativo': return 'text-blue-600';
      case 'passivo': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            'justify-between font-normal',
            !selectedCategory && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <span className={cn('text-xs', getTypeColor(selectedCategory.tipo))}>
                  {selectedCategory.codigo}
                </span>
                <span>{selectedCategory.nome}</span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {value && (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground mb-1"
                onClick={handleClear}
              >
                Limpar seleção
              </Button>
            )}
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhuma categoria encontrada
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start font-normal h-auto py-2',
                    value === category.id && 'bg-accent'
                  )}
                  style={{ paddingLeft: `${(category.indent * 16) + 8}px` }}
                  onClick={() => handleSelect(category)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {category.indent > 0 && (
                      <FolderTree className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={cn('text-xs font-mono', getTypeColor(category.tipo))}>
                      {category.codigo}
                    </span>
                    <span className="truncate flex-1 text-left">{category.nome}</span>
                    {value === category.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
        {filterType === 'all' && (
          <div className="p-2 border-t bg-muted/50">
            <div className="flex gap-2 text-xs">
              <span className="text-green-600">● Receita</span>
              <span className="text-red-600">● Despesa</span>
              <span className="text-blue-600">● Ativo</span>
              <span className="text-orange-600">● Passivo</span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CategoryPicker;
