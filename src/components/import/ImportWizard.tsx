import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react';
import { ERPSelector } from './ERPSelector';
import { DataTypeSelector } from './DataTypeSelector';
import { FileUploader } from './FileUploader';
import { ImportPreview } from './ImportPreview';
import { useERPImport, ERPConfig, DataType, ParsedRow } from '@/hooks/useERPImport';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';

type WizardStep = 'erp' | 'type' | 'upload' | 'preview';

const STEPS: { id: WizardStep; title: string }[] = [
  { id: 'erp', title: 'ERP' },
  { id: 'type', title: 'Tipo' },
  { id: 'upload', title: 'Upload' },
  { id: 'preview', title: 'Preview' }
];

interface ImportWizardProps {
  onComplete?: () => void;
}

export function ImportWizard({ onComplete }: ImportWizardProps) {
  const { toast } = useToast();
  const { selectedCompanyIds } = useCompanyContext();
  
  const { importing, importFile, parsePreview } = useERPImport();

  const [currentStep, setCurrentStep] = useState<WizardStep>('erp');
  const [selectedERP, setSelectedERP] = useState<ERPConfig | null>(null);
  const [selectedType, setSelectedType] = useState<DataType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'erp': return selectedERP !== null;
      case 'type': return selectedType !== null;
      case 'upload': return file !== null;
      case 'preview': return parsedData.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      // Se for para o preview, processar o arquivo
      if (STEPS[nextIndex].id === 'preview' && file && selectedERP && selectedType) {
        setLoading(true);
        try {
          const preview = await parsePreview(file, selectedERP.id, selectedType);
          setParsedData(preview);
        } catch (error: any) {
          setUploadError(error.message);
          return;
        } finally {
          setLoading(false);
        }
      }
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedERP || !selectedType) return;
    
    if (selectedCompanyIds.length === 0) {
      toast({
        title: 'Selecione uma empresa',
        description: 'É necessário selecionar uma empresa para importar os dados.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await importFile(file, selectedERP.id, selectedType, selectedCompanyIds[0]);
      onComplete?.();
      resetWizard();
    } catch (error) {
      // Error handled in hook
    }
  };

  const resetWizard = () => {
    setCurrentStep('erp');
    setSelectedERP(null);
    setSelectedType(null);
    setFile(null);
    setParsedData([]);
    setUploadError(undefined);
  };

  const handleERPSelect = (erp: ERPConfig) => {
    setSelectedERP(erp);
    setSelectedType(null);
    setFile(null);
    setParsedData([]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, idx) => (
              <div 
                key={step.id}
                className={`text-sm font-medium ${
                  idx <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'erp' && (
            <ERPSelector 
              selectedERP={selectedERP?.id || null}
              onSelect={handleERPSelect}
            />
          )}
          
          {currentStep === 'type' && selectedERP && (
            <DataTypeSelector
              selectedERP={selectedERP}
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          )}
          
          {currentStep === 'upload' && selectedERP && (
            <FileUploader
              selectedERP={selectedERP}
              file={file}
              onFileSelect={setFile}
              error={uploadError}
            />
          )}
          
          {currentStep === 'preview' && selectedType && (
            <ImportPreview
              dataType={selectedType}
              parsedData={parsedData}
              loading={loading}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          {currentStep === 'preview' ? (
            <Button 
              onClick={handleImport}
              disabled={importing || parsedData.length === 0}
            >
              {importing ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
