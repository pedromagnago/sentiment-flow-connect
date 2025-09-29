import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useSuggestedActionDetails } from "@/hooks/useSuggestedActionDetails";

interface ActionOriginBadgeProps {
  suggestedActionId?: string | null;
  contactId?: string | null;
}

export const ActionOriginBadge = ({
  suggestedActionId,
  contactId,
}: ActionOriginBadgeProps) => {
  const navigate = useNavigate();
  const { data: actionDetails } = useSuggestedActionDetails(suggestedActionId);

  if (!suggestedActionId) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        Manual
      </Badge>
    );
  }

  const handleClick = () => {
    if (contactId) {
      navigate(`/whatsapp/chats?contact=${contactId}&action=${suggestedActionId}`);
    } else {
      navigate(`/suggested-actions?highlight=${suggestedActionId}`);
    }
  };

  const confidencePercent = actionDetails?.ai_confidence 
    ? Math.round(Number(actionDetails.ai_confidence) * 100) 
    : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={handleClick}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          IA
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1 text-sm">
          <p className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Criado por IA
          </p>
          {actionDetails?.action_type && (
            <p className="text-muted-foreground">
              Tipo: <span className="font-medium">{actionDetails.action_type}</span>
            </p>
          )}
          {confidencePercent > 0 && (
            <p className="text-muted-foreground">
              Confiança: <span className="font-medium">{confidencePercent}%</span>
            </p>
          )}
          {actionDetails?.created_at && (
            <p className="text-muted-foreground">
              Data: {format(new Date(actionDetails.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          )}
          <p className="text-xs text-blue-600 mt-2">Clique para ver detalhes</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
