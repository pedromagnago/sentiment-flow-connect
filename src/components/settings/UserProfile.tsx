import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface UserProfileData {
  display_name: string;
  cargo: string;
  ativo: boolean;
  especialidade: string[];
  max_atendimentos_simultaneos: number;
  horario_atendimento: {
    inicio: string;
    fim: string;
    dias: string[];
  };
}

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEspecialidade, setNewEspecialidade] = useState('');
  const [profile, setProfile] = useState<UserProfileData>({
    display_name: '',
    cargo: '',
    ativo: true,
    especialidade: [],
    max_atendimentos_simultaneos: 5,
    horario_atendimento: {
      inicio: '09:00',
      fim: '18:00',
      dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    }
  });

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          cargo: data.cargo || '',
          ativo: data.ativo ?? true,
          especialidade: data.especialidade || [],
          max_atendimentos_simultaneos: data.max_atendimentos_simultaneos || 5,
          horario_atendimento: (data.horario_atendimento as any) || {
            inicio: '09:00',
            fim: '18:00',
            dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
          }
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar perfil',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile.display_name,
          cargo: profile.cargo,
          ativo: profile.ativo,
          especialidade: profile.especialidade,
          max_atendimentos_simultaneos: profile.max_atendimentos_simultaneos,
          horario_atendimento: profile.horario_atendimento
        });

      if (error) throw error;

      toast({
        title: 'Perfil salvo',
        description: 'Suas configurações foram atualizadas com sucesso.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar perfil',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addEspecialidade = () => {
    if (newEspecialidade.trim() && !profile.especialidade.includes(newEspecialidade.trim())) {
      setProfile({
        ...profile,
        especialidade: [...profile.especialidade, newEspecialidade.trim()]
      });
      setNewEspecialidade('');
    }
  };

  const removeEspecialidade = (especialidade: string) => {
    setProfile({
      ...profile,
      especialidade: profile.especialidade.filter(e => e !== especialidade)
    });
  };

  const toggleDia = (dia: string) => {
    const dias = profile.horario_atendimento.dias.includes(dia)
      ? profile.horario_atendimento.dias.filter(d => d !== dia)
      : [...profile.horario_atendimento.dias, dia];

    setProfile({
      ...profile,
      horario_atendimento: {
        ...profile.horario_atendimento,
        dias
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={profile.cargo}
              onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
              placeholder="Seu cargo ou função"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_atendimentos">Máximo de Atendimentos Simultâneos</Label>
          <Input
            id="max_atendimentos"
            type="number"
            min="1"
            max="20"
            value={profile.max_atendimentos_simultaneos}
            onChange={(e) => setProfile({ 
              ...profile, 
              max_atendimentos_simultaneos: parseInt(e.target.value) || 1 
            })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={profile.ativo}
            onCheckedChange={(checked) => setProfile({ ...profile, ativo: checked })}
          />
          <Label>Ativo para receber atendimentos</Label>
        </div>

        <div className="space-y-2">
          <Label>Especialidades</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.especialidade.map((especialidade) => (
              <Badge key={especialidade} variant="secondary" className="flex items-center gap-1">
                {especialidade}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeEspecialidade(especialidade)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newEspecialidade}
              onChange={(e) => setNewEspecialidade(e.target.value)}
              placeholder="Adicionar especialidade"
              onKeyPress={(e) => e.key === 'Enter' && addEspecialidade()}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={addEspecialidade}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Horário de Atendimento</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inicio">Início</Label>
              <Input
                id="inicio"
                type="time"
                value={profile.horario_atendimento.inicio}
                onChange={(e) => setProfile({
                  ...profile,
                  horario_atendimento: {
                    ...profile.horario_atendimento,
                    inicio: e.target.value
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fim">Fim</Label>
              <Input
                id="fim"
                type="time"
                value={profile.horario_atendimento.fim}
                onChange={(e) => setProfile({
                  ...profile,
                  horario_atendimento: {
                    ...profile.horario_atendimento,
                    fim: e.target.value
                  }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <Badge
                  key={dia.key}
                  variant={profile.horario_atendimento.dias.includes(dia.key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDia(dia.key)}
                >
                  {dia.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={saveProfile} 
          disabled={saving}
          className="w-full md:w-auto"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};