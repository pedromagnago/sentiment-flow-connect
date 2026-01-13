import React, { useState } from 'react';
import { useSmartClassificationSuggestions } from '@/hooks/useSmartClassificationSuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { 
  Wand2, 
  Users, 
  User, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoClassifyPage() {
  const {
    suggestions,
    loading,
    error,
    applyClassification,
    applyAllSuggestions,
    unclassifiedCount,
    refetch
  } = useSmartClassificationSuggestions();

  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);

  const toggleExpanded = (pattern: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pattern)) {
        newSet.delete(pattern);
      } else {
        newSet.add(pattern);
      }
      return newSet;
    });
  };

  const handleApply = async (suggestion: any) => {
    setApplying(suggestion.pattern);
    const result = await applyClassification(suggestion);
    setApplying(null);

    if (result.success) {
      toast.success(`${result.count} contatos classificados com sucesso!`);
    } else {
      toast.error(`Erro: ${result.error}`);
    }
  };

  const handleApplyAll = async () => {
    if (suggestions.length === 0) return;
    
    setApplyingAll(true);
    const result = await applyAllSuggestions();
    setApplyingAll(false);

    if (result.success) {
      toast.success(`${result.count} contatos classificados com sucesso!`);
    } else {
      toast.error(`Erro: ${result.error}`);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta confiança';
      case 'medium': return 'Média confiança';
      case 'low': return 'Baixa confiança';
      default: return 'Desconhecida';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const totalContactsToClassify = suggestions.reduce(
    (sum, s) => sum + s.matchingContacts.length, 
    0
  );

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Classificação Automática</h1>
            <p className="text-sm text-muted-foreground">
              Sugestões inteligentes baseadas em padrões de nomes
            </p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <Button 
            onClick={handleApplyAll} 
            disabled={applyingAll}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {applyingAll ? 'Aplicando...' : `Aplicar Todas (${totalContactsToClassify} contatos)`}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{unclassifiedCount}</p>
                <p className="text-xs text-muted-foreground">Contatos não classificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{suggestions.length}</p>
                <p className="text-xs text-muted-foreground">Sugestões encontradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalContactsToClassify}</p>
                <p className="text-xs text-muted-foreground">Contatos a classificar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wand2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma sugestão encontrada</h3>
            <p className="text-muted-foreground">
              Não foi possível identificar padrões nos nomes dos contatos não classificados.
              Tente classificar manualmente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.pattern} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      Padrão: "{suggestion.pattern}"
                    </CardTitle>
                    <Badge className={getConfidenceColor(suggestion.confidence)}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {suggestion.matchingContacts.length} contatos
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleApply(suggestion)}
                      disabled={applying === suggestion.pattern}
                    >
                      {applying === suggestion.pattern ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(suggestion.pattern)}
                    >
                      {expandedSuggestions.has(suggestion.pattern) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Será classificado como: <span className="font-medium text-foreground">{suggestion.suggestedCompanyName}</span>
                </p>
              </CardHeader>

              {expandedSuggestions.has(suggestion.pattern) && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Contatos que serão classificados:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {suggestion.matchingContacts.map((contact) => (
                        <div
                          key={contact.id_contact}
                          className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                        >
                          {contact.is_group ? (
                            <Users className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm truncate flex-1">{contact.nome}</span>
                          <Badge variant="secondary" className="text-xs">
                            {contact.messageCount} msgs
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
