import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'operator' | 'viewer'>('operator');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const { inviteUser, loading } = useTeamManagement();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha email e role',
        variant: 'destructive',
      });
      return;
    }

    const result = await inviteUser(email, role);
    if (result.success && result.token) {
      setInviteToken(result.token);
      onSuccess();
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Link copiado',
      description: 'Link de convite copiado para a área de transferência',
    });
  };

  const handleClose = () => {
    setEmail('');
    setRole('operator');
    setInviteToken(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Membro da Equipe</DialogTitle>
          <DialogDescription>
            {inviteToken
              ? 'Convite criado! Copie o link abaixo e envie para o novo membro.'
              : 'Preencha os dados para criar um convite de acesso.'}
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {role === 'admin' && 'Acesso total ao sistema'}
                {role === 'supervisor' && 'Pode gerenciar operadores e visualizar relatórios'}
                {role === 'operator' && 'Pode executar tarefas diárias'}
                {role === 'viewer' && 'Apenas visualização, sem edições'}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando convite...' : 'Criar Convite'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/accept-invite?token=${inviteToken}`}
                className="font-mono text-sm"
              />
              <Button size="icon" variant="outline" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              O link expira em 7 dias. Envie-o via WhatsApp, email ou outro canal seguro.
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
