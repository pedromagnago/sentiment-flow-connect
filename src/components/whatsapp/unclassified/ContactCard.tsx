import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, Building2, Eye } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';
import { ContactPreview } from './ContactPreview';
import { SmartSuggestion } from './SmartSuggestion';
import { ClassificationSuggestion } from '@/hooks/useSmartClassification';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContactCardProps {
  contact: Contact;
  messageCount: number;
  isSelected: boolean;
  suggestion?: ClassificationSuggestion;
  onToggleSelect: () => void;
  onClassify: () => void;
  onAutoClassify?: (companyId: string) => void;
}

export const ContactCard = ({
  contact,
  messageCount,
  isSelected,
  suggestion,
  onToggleSelect,
  onClassify,
  onAutoClassify
}: ContactCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Card className={`hover:border-primary/50 transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="mt-1"
          />

          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">
                    {contact.nome || 'Sem nome'}
                  </span>
                  {contact.is_group && (
                    <Badge variant="outline" className="text-xs">Grupo</Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Telefone: {contact.id_contact}</div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {messageCount} mensagens
                  </div>
                </div>
              </div>

              <Button
                onClick={onClassify}
                size="sm"
                className="flex-shrink-0"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Classificar
              </Button>
            </div>

            {/* Smart Suggestion */}
            {suggestion && onAutoClassify && (
              <SmartSuggestion
                suggestion={suggestion}
                onAutoClassify={() => onAutoClassify(suggestion.companyId)}
              />
            )}

            {/* Message Preview Toggle */}
            {messageCount > 0 && (
              <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Ocultar' : 'Ver'} últimas mensagens
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <ContactPreview contactId={contact.id_contact} />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
