import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { useCompanyContext } from '@/contexts/CompanyContext';

export const CompanySettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeCompanyId } = useCompanyContext();
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCompanySettings();
  }, [user]);

  const loadCompanySettings = async () => {
    if (!user || !activeCompanyId) return;

    try {
      setIsLoading(true);

      // Get company data
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', activeCompanyId)
        .single();

      if (companyError) throw companyError;

      if (company) {
        setCompanyName(company.nome || '');
        setCnpj(company.cnpj || '');
        setEmail(company.email || '');
        setPhone(company.telefone || '');
        setAddress(company.endereco || '');
      }
    } catch (error: any) {
      console.error('Error loading company settings:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCompanySettings = async () => {
    if (!activeCompanyId) {
      toast({
        title: 'Erro',
        description: 'ID da empresa não encontrado',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('companies')
        .update({
          nome: companyName,
          cnpj: cnpj,
          email: email,
          telefone: phone,
          endereco: address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeCompanyId);

      if (error) throw error;

      toast({
        title: '✅ Configurações salvas',
        description: 'Os dados da empresa foram atualizados com sucesso',
      });
    } catch (error: any) {
      console.error('Error saving company settings:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Configurações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Configurações da Empresa
        </CardTitle>
        <CardDescription>
          Gerencie as informações da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa *</Label>
            <Input
              id="company-name"
              type="text"
              placeholder="Minha Empresa Ltda"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Textarea
            id="address"
            placeholder="Rua, número, bairro, cidade, estado"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={saveCompanySettings} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
