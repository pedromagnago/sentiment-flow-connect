import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Building2 } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CreatePeriodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePeriodModal: React.FC<CreatePeriodModalProps> = ({
  open,
  onOpenChange
}) => {
  const { companies } = useCompanies();
  const queryClient = useQueryClient();
  
  const [companyId, setCompanyId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!companyId || !periodStart || !periodEnd) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (new Date(periodEnd) < new Date(periodStart)) {
      toast.error('Data final deve ser maior que a inicial');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('audit_periods')
        .insert({
          company_id: companyId,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'open'
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este período já existe para esta empresa');
        }
        throw error;
      }

      toast.success('Período criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['audit-periods'] });
      onOpenChange(false);
      setCompanyId('');
      setPeriodStart('');
      setPeriodEnd('');
    } catch (error: any) {
      console.error('Error creating period:', error);
      toast.error(error.message || 'Erro ao criar período');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate quick date options
  const getThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const getLastWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const getThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const applyPreset = (preset: 'thisWeek' | 'lastWeek' | 'thisMonth') => {
    const dates = preset === 'thisWeek' ? getThisWeek() : 
                  preset === 'lastWeek' ? getLastWeek() : 
                  getThisMonth();
    setPeriodStart(dates.start);
    setPeriodEnd(dates.end);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Criar Período de Auditoria
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {company.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              onClick={() => applyPreset('thisWeek')}
            >
              Esta Semana
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              onClick={() => applyPreset('lastWeek')}
            >
              Semana Passada
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              onClick={() => applyPreset('thisMonth')}
            >
              Este Mês
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Data Inicial</Label>
              <Input
                id="periodStart"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Data Final</Label>
              <Input
                id="periodEnd"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Período'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
