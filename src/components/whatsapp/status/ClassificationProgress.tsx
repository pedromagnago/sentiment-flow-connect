import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserX, UsersRound, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClassificationProgressProps {
  totalContacts: number;
  classifiedContacts: number;
  unclassifiedContacts: number;
  groups: number;
  individuals: number;
}

export const ClassificationProgress: React.FC<ClassificationProgressProps> = ({
  totalContacts,
  classifiedContacts,
  unclassifiedContacts,
  groups,
  individuals
}) => {
  const classificationPercentage = totalContacts > 0 
    ? Math.round((classifiedContacts / totalContacts) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Progresso de Classificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Classificados</span>
            <span className="font-semibold">{classificationPercentage}%</span>
          </div>
          <Progress value={classificationPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{classifiedContacts} classificados</span>
            <span>{unclassifiedContacts} pendentes</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <UserCheck className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">{classifiedContacts}</p>
              <p className="text-xs text-green-600">Classificados</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <UserX className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{unclassifiedContacts}</p>
              <p className="text-xs text-amber-600">Pendentes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <UsersRound className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{groups}</p>
              <p className="text-xs text-blue-600">Grupos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <User className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{individuals}</p>
              <p className="text-xs text-purple-600">Individuais</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
