import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

interface InvitationCompany {
  company_id: string;
  role: string;
  company_name?: string;
}

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [invitationCompanies, setInvitationCompanies] = useState<InvitationCompany[]>([]);
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
      // Buscar convite pelo token
      const { data: inviteData, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError) throw inviteError;

      if (!inviteData) {
        setError('Convite não encontrado');
        return;
      }

      if (inviteData.status !== 'pending') {
        setError('Este convite já foi usado ou está expirado');
        return;
      }

      const expiresAt = new Date(inviteData.expires_at);
      if (expiresAt < new Date()) {
        setError('Este convite expirou');
        return;
      }

      setInvitation(inviteData);

      // Buscar empresas vinculadas ao convite
      const { data: companiesData } = await (supabase as any)
        .from('invitation_companies')
        .select('company_id, role, companies(nome)')
        .eq('invitation_id', inviteData.id);

      if (companiesData && companiesData.length > 0) {
        // Múltiplas empresas no convite
        setInvitationCompanies(companiesData.map((ic: any) => ({
          company_id: ic.company_id,
          role: ic.role,
          company_name: ic.companies?.nome || 'Empresa',
        })));
      } else if (inviteData.company_id) {
        // Convite com empresa única (formato antigo)
        const { data: companyData } = await supabase
          .from('companies')
          .select('nome')
          .eq('id', inviteData.company_id)
          .single();

        setInvitationCompanies([{
          company_id: inviteData.company_id,
          role: inviteData.role,
          company_name: companyData?.nome || 'Empresa',
        }]);
      } else {
        setError('Convite sem empresa associada');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      
      // Verificar se usuário já está logado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirecionar para signup com email pre-preenchido
        navigate(`/auth?email=${encodeURIComponent(invitation.email)}&invite_token=${token}`);
        return;
      }

      // Usuário logado - criar user_role para CADA empresa do convite
      for (const ic of invitationCompanies) {
        // Verificar se já existe role para esta empresa
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('company_id', ic.company_id)
          .eq('is_active', true)
          .is('revoked_at', null)
          .maybeSingle();

        if (existingRole) {
          console.log(`Usuário já tem acesso à empresa ${ic.company_name}`);
          continue;
        }

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{
            user_id: user.id,
            company_id: ic.company_id,
            role: ic.role as 'admin' | 'supervisor' | 'operator' | 'viewer' | 'owner',
            granted_by: invitation.invited_by,
            is_active: true,
          }]);

        if (roleError) {
          console.error(`Erro ao criar role para empresa ${ic.company_name}:`, roleError);
        }
      }

      // Marcar convite como aceito
      await supabase
        .from('team_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      toast({
        title: 'Convite aceito!',
        description: `Bem-vindo! Você agora tem acesso a ${invitationCompanies.length} empresa(s).`,
      });

      navigate('/');
    } catch (err: any) {
      toast({
        title: 'Erro ao aceitar convite',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
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
          <div className="bg-slate-100 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold">Email:</span>
              <span>{invitation?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Expira em:</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(invitation?.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Lista de empresas do convite */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              <span>Acesso às empresas:</span>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
              {invitationCompanies.map((ic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{ic.company_name}</span>
                  <Badge variant="secondary" className="capitalize">
                    {ic.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? 'Aceitando...' : 'Aceitar Convite'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Ao aceitar, você terá acesso ao sistema FullBPO com as permissões listadas acima.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitePage;