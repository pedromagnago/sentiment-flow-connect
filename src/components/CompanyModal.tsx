
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Company } from '@/hooks/useCompanies';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Partial<Company>) => Promise<void>;
  company?: Company | null;
}

export const CompanyModal = ({ isOpen, onClose, onSave, company }: CompanyModalProps) => {
  const [formData, setFormData] = useState<Partial<Company>>({
    nome: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    responsavel: '',
    cargo_responsavel: '',
    segmento: '',
    atividade: '',
    valor_mensalidade: 0,
    status: 'Ativo',
    n8n_integration_active: false,
    aceitar_politica_privacidade: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || '',
        cnpj: company.cnpj || '',
        endereco: company.endereco || '',
        numero: company.numero || '',
        complemento: company.complemento || '',
        bairro: company.bairro || '',
        cidade: company.cidade || '',
        estado: company.estado || '',
        cep: company.cep || '',
        telefone: company.telefone || '',
        email: company.email || '',
        responsavel: company.responsavel || '',
        cargo_responsavel: company.cargo_responsavel || '',
        segmento: company.segmento || '',
        atividade: company.atividade || '',
        valor_mensalidade: company.valor_mensalidade || 0,
        status: company.status || 'Ativo',
        n8n_integration_active: company.n8n_integration_active || false,
        aceitar_politica_privacidade: company.aceitar_politica_privacidade || false,
      });
    } else {
      setFormData({
        nome: '',
        cnpj: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        responsavel: '',
        cargo_responsavel: '',
        segmento: '',
        atividade: '',
        valor_mensalidade: 0,
        status: 'Ativo',
        n8n_integration_active: false,
        aceitar_politica_privacidade: false,
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (field: keyof Company) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo_responsavel">Cargo do Responsável</Label>
              <Input
                id="cargo_responsavel"
                value={formData.cargo_responsavel || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cargo_responsavel: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento</Label>
              <Input
                id="segmento"
                value={formData.segmento || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, segmento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="atividade">Atividade</Label>
              <Input
                id="atividade"
                value={formData.atividade || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, atividade: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_mensalidade">Valor Mensalidade</Label>
              <Input
                id="valor_mensalidade"
                type="number"
                step="0.01"
                value={formData.valor_mensalidade || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_mensalidade: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="n8n_integration_active"
                checked={formData.n8n_integration_active || false}
                onCheckedChange={handleSwitchChange('n8n_integration_active')}
              />
              <Label htmlFor="n8n_integration_active">Integração N8N Ativa</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aceitar_politica_privacidade"
                checked={formData.aceitar_politica_privacidade || false}
                onCheckedChange={handleSwitchChange('aceitar_politica_privacidade')}
              />
              <Label htmlFor="aceitar_politica_privacidade">Aceitar Política de Privacidade</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : company ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
