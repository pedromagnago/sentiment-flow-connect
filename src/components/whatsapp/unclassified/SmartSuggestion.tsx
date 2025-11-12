import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';
import { ClassificationSuggestion } from '@/hooks/useSmartClassification';

interface SmartSuggestionProps {
  suggestion: ClassificationSuggestion;
  onAutoClassify: () => void;
}

export const SmartSuggestion = ({ suggestion, onAutoClassify }: SmartSuggestionProps) => {
  const confidenceColors = {
    high: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
  };

  const confidenceLabels = {
    high: 'Alta Confiança',
    medium: 'Média Confiança',
    low: 'Baixa Confiança'
  };

  return (
    <Alert className={`${confidenceColors[suggestion.confidence]} border animate-in fade-in duration-300`}>
      <Sparkles className="w-4 h-4" />
      <AlertDescription className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">Sugestão Automática:</span>
            <Badge variant="outline" className="text-xs">
              {confidenceLabels[suggestion.confidence]}
            </Badge>
          </div>
          <div className="text-sm">
            <strong>{suggestion.companyName}</strong>
            <span className="text-muted-foreground ml-2">• {suggestion.reason}</span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={onAutoClassify}
          className="flex-shrink-0"
          variant={suggestion.confidence === 'high' ? 'default' : 'outline'}
        >
          <Zap className="w-4 h-4 mr-2" />
          Aplicar
        </Button>
      </AlertDescription>
    </Alert>
  );
};
