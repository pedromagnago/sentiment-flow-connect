import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  DataType, 
  DATA_TYPE_LABELS, 
  DATA_TYPE_ICONS,
  ERPConfig 
} from '@/hooks/useERPImport';

interface DataTypeSelectorProps {
  selectedERP: ERPConfig;
  selectedType: DataType | null;
  onSelect: (type: DataType) => void;
}

export function DataTypeSelector({ selectedERP, selectedType, onSelect }: DataTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Tipo de Dados</h2>
        <p className="text-muted-foreground text-sm mt-1">
          O que você deseja importar do {selectedERP.name}?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {selectedERP.supportedTypes.map((type) => (
          <Card
            key={type}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
              'border-2',
              selectedType === type 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-transparent hover:border-muted-foreground/20'
            )}
            onClick={() => onSelect(type)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="text-4xl">
                {DATA_TYPE_ICONS[type]}
              </div>
              
              <span className="font-medium text-foreground">
                {DATA_TYPE_LABELS[type]}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
