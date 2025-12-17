import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ERP_CONFIGS, ERPConfig } from '@/hooks/useERPImport';
import { Star, Clock } from 'lucide-react';

interface ERPSelectorProps {
  selectedERP: string | null;
  onSelect: (erp: ERPConfig) => void;
}

export function ERPSelector({ selectedERP, onSelect }: ERPSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Selecione o ERP de Origem</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o sistema de onde você exportou os dados
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ERP_CONFIGS.map((erp) => (
          <Card
            key={erp.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
              'border-2',
              selectedERP === erp.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-transparent hover:border-muted-foreground/20',
              erp.comingSoon && 'opacity-60 cursor-not-allowed'
            )}
            onClick={() => !erp.comingSoon && onSelect(erp)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div 
                className="text-4xl mb-1"
                style={{ filter: erp.comingSoon ? 'grayscale(1)' : 'none' }}
              >
                {erp.logo}
              </div>
              
              <span className="font-medium text-foreground">{erp.name}</span>
              
              <div className="flex flex-wrap gap-1 justify-center">
                {erp.popular && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Star className="h-3 w-3" />
                    Popular
                  </Badge>
                )}
                {erp.comingSoon && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="h-3 w-3" />
                    Em breve
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {erp.supportedFormats.map(f => f.toUpperCase()).join(', ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
