import React, { useEffect, useState } from 'react';
import { useTeamManagement, type TeamMember } from '@/hooks/useTeamManagement';
import { TeamMemberCard } from './TeamMemberCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users } from 'lucide-react';

interface TeamMemberListProps {
  refresh: number;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({ refresh }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { listMembers, updateRole, deactivateUser } = useTeamManagement();

  useEffect(() => {
    loadMembers();
  }, [refresh]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await listMembers();
    setMembers(data);
    setLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const success = await updateRole(userId, newRole as any);
    if (success) {
      loadMembers();
    }
  };

  const handleDeactivate = async (userId: string) => {
    const success = await deactivateUser(userId);
    if (success) {
      loadMembers();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Nenhum membro encontrado. Convide o primeiro membro da sua equipe!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onUpdateRole={handleUpdateRole}
          onDeactivate={handleDeactivate}
        />
      ))}
    </div>
  );
};
