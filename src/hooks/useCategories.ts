import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

export interface Category {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'ativo' | 'passivo';
  parent_id: string | null;
  dre_grupo: string | null;
  fluxo_caixa_tipo: string | null;
  is_fixed: boolean;
  is_active: boolean;
  nivel: number;
  ordem: number;
  company_id: string | null;
  children?: Category[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  path: string;
  fullName: string;
}

export const useCategories = () => {
  const { activeCompanyId } = useCompanyContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch global categories (company_id IS NULL) and company-specific
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .or(`company_id.is.null,company_id.eq.${activeCompanyId || '00000000-0000-0000-0000-000000000000'}`)
        .eq('is_active', true)
        .order('nivel', { ascending: true })
        .order('ordem', { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data as Category[]);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeCompanyId]);

  // Build hierarchical tree
  const categoryTree = useMemo((): CategoryTree[] => {
    const buildTree = (items: Category[], parentId: string | null = null, path = ''): CategoryTree[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => {
          const currentPath = path ? `${path} > ${item.nome}` : item.nome;
          const children = buildTree(items, item.id, currentPath);
          return {
            ...item,
            children,
            path: currentPath,
            fullName: `${item.codigo} - ${item.nome}`
          };
        })
        .sort((a, b) => a.ordem - b.ordem);
    };

    return buildTree(categories);
  }, [categories]);

  // Flat list with indentation info
  const flatCategories = useMemo((): (Category & { indent: number; path: string })[] => {
    const flatten = (items: CategoryTree[], indent = 0): (Category & { indent: number; path: string })[] => {
      return items.flatMap(item => [
        { ...item, indent, path: item.path },
        ...flatten(item.children, indent + 1)
      ]);
    };
    return flatten(categoryTree);
  }, [categoryTree]);

  // Get categories by type
  const getCategoriesByType = (tipo: 'receita' | 'despesa' | 'ativo' | 'passivo') => {
    return flatCategories.filter(c => c.tipo === tipo);
  };

  // Get leaf categories (no children)
  const leafCategories = useMemo(() => {
    return flatCategories.filter(c => {
      const hasChildren = categories.some(cat => cat.parent_id === c.id);
      return !hasChildren;
    });
  }, [flatCategories, categories]);

  // Find category by ID
  const findCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };

  // Find category by codigo
  const findCategoryByCodigo = (codigo: string) => {
    return categories.find(c => c.codigo === codigo);
  };

  return {
    categories,
    categoryTree,
    flatCategories,
    leafCategories,
    loading,
    error,
    refetch: fetchCategories,
    getCategoriesByType,
    findCategoryById,
    findCategoryByCodigo
  };
};
