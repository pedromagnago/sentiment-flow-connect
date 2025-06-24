
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { ClickUpConfiguration } from './companies/ClickUpConfiguration';

interface Company {
  id?: string;
  nome?: string;
  cnpj?: string;
  segmento?: string;
  status?: string;
  valor_mensalidade?: number;
  n8n_integration_active?: boolean;
  clickup_api_key?: string;
  clickup_workspace_id?: string;
  clickup_integration_status?: string;
  // Address fields
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  cargo_responsavel?: string;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Partial<Company>) => Promise<any>;
  company?: Company | null;
}

export const CompanyModal = ({ isOpen, onClose, onSave, company }: CompanyModalProps) => {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    segmento: '',
    status: 'Ativa',
    valor_mensalidade: 0,
    n8n_integration_active: false,
    clickup_api_key: '',
    clickup_workspace_id: '',
    clickup_integration_status: '',
    // Address fields
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
  });

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome || '',
        cnpj: company.cnpj || '',
        segmento: company.segmento || '',
        status: company.status || 'Ativa',
        valor_mensalidade: company.valor_mensalidade || 0,
        n8n_integration_active: company.n8n_integration_active || false,
        clickup_api_key: company.clickup_api_key || '',
        clickup_workspace_id: company.clickup_workspace_id || '',
        clickup_integration_status: company.clickup_integration_status || '',
        // Address fields
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
      });
    } else {
      // Reset form when creating a new company
      setFormData({
        nome: '',
        cnpj: '',
        segmento: '',
        status: 'Ativa',
        valor_mensalidade: 0,
        n8n_integration_active: false,
        clickup_api_key: '',
        clickup_workspace_id: '',
        clickup_integration_status: '',
        // Address fields
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
      });
    }
  }, [company]);

  const handleClickUpConfigUpdate = (config: any) => {
    setFormData(prev => ({
      ...prev,
      ...config
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'valor_mensalidade' ? Number(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
      toast({
        title: "Sucesso",
        description: company ? "Empresa atualizada com sucesso!" : "Empresa criada com sucesso!",
      })
    } catch (error: any) {
      console.error("Error saving company:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a empresa.",
      })
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="contact">Contato</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="clickup">ClickUp</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmento">Segmento</Label>
              <Input
                id="segmento"
                name="segmento"
                value={formData.segmento}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  defaultValue={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativa">Ativa</SelectItem>
                    <SelectItem value="Inativa">Inativa</SelectItem>
                    <SelectItem value="Em negociação">Em negociação</SelectItem>
                    <SelectItem value="Proposta enviada">Proposta enviada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_mensalidade">Valor Mensalidade</Label>
                <Input
                  id="valor_mensalidade"
                  name="valor_mensalidade"
                  type="number"
                  step="0.01"
                  value={formData.valor_mensalidade}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo_responsavel">Cargo do Responsável</Label>
                <Input
                  id="cargo_responsavel"
                  name="cargo_responsavel"
                  value={formData.cargo_responsavel}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="n8n_integration_active">Integração com N8N</Label>
              <Switch
                id="n8n_integration_active"
                name="n8n_integration_active"
                checked={formData.n8n_integration_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, n8n_integration_active: checked }))}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="clickup" className="space-y-4">
            <ClickUpConfiguration
              companyId={company?.id || ''}
              currentConfig={{
                clickup_api_key: formData.clickup_api_key,
                clickup_workspace_id: formData.clickup_workspace_id,
                clickup_integration_status: formData.clickup_integration_status
              }}
              onConfigUpdate={handleClickUpConfigUpdate}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {company ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
