import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado');
      setLoading(false);
      return;
    }

    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Convite não encontrado');
        return;
      }

      if (data.status !== 'pending') {
        setError('Este convite já foi usado ou está expirado');
        return;
      }

      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setError('Este convite expirou');
        return;
      }

      setInvitation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      // Verificar se usuário já está logado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirecionar para signup com email pre-preenchido
        navigate(`/auth?email=${encodeURIComponent(invitation.email)}&invite_token=${token}`);
        return;
      }

      // Usuário já logado - buscar user_roles para obter company_id
      const { data: roles } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('revoked_at', null)
        .limit(1)
        .single();

      const companyId = roles?.company_id;
      if (!companyId) {
        throw new Error('Perfil sem company_id. Complete o onboarding primeiro.');
      }

      // Criar user_role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          company_id: companyId,
          role: invitation.role,
          granted_by: invitation.invited_by,
          is_active: true,
        });

      if (roleError) throw roleError;

      // Marcar convite como aceito
      await supabase
        .from('team_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      toast({
        title: 'Convite aceito!',
        description: 'Bem-vindo à equipe FullBPO',
      });

      navigate('/');
    } catch (err: any) {
      toast({
        title: 'Erro ao aceitar convite',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <LoadingSpinner />
            <p className="mt-4">Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-center">Convite Inválido</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/')}>
              Ir para a página inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center">Você foi convidado!</CardTitle>
          <CardDescription className="text-center">
            Você recebeu um convite para se juntar à equipe FullBPO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Email:</span>
              <span>{invitation?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Role:</span>
              <span className="capitalize">{invitation?.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Expira em:</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(invitation?.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleAccept}>
            Aceitar Convite
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Ao aceitar, você terá acesso ao sistema FullBPO com as permissões de{' '}
            <strong>{invitation?.role}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;
