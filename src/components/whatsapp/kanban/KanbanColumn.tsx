import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { ConversationCard } from './ConversationCard';
import type { Conversation } from '../WhatsAppInterface';
import type { ConversationAssignment } from '@/hooks/useConversationAssignments';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  conversations: Conversation[];
  assignments: ConversationAssignment[];
  onSelectConversation: (contactId: string | null) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  conversations,
  assignments,
  onSelectConversation
}) => {
  return (
    <div className={`rounded-lg border-2 ${color} bg-card`}>
      {/* Header da coluna */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
            {conversations.length}
          </span>
        </div>
      </div>

      {/* Lista de conversas */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/50' : ''
            }`}
          >
            <div className="space-y-2">
              {conversations.map((conversation, index) => {
                const assignment = assignments.find(a => a.contact_id === conversation.contact.id_contact);
                return (
                  <ConversationCard
                    key={conversation.contact.id_contact}
                    index={index}
                    conversation={conversation}
                    assignment={assignment}
                    onSelectConversation={onSelectConversation}
                  />
                );
              })}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};