import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from '../kanban/KanbanColumn';
import { ConversationCard } from '../kanban/ConversationCard';
import { useConversationAssignments } from '@/hooks/useConversationAssignments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { Conversation } from '../WhatsAppInterface';

interface QueueViewProps {
  conversations: Conversation[];
  onSelectConversation: (contactId: string | null) => void;
}

const statusColumns = [
  { id: 'aguardando', title: 'Aguardando', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'bg-blue-100 border-blue-300' },
  { id: 'aguardando_retorno', title: 'Aguardando Retorno', color: 'bg-orange-100 border-orange-300' },
  { id: 'finalizado', title: 'Finalizado', color: 'bg-green-100 border-green-300' }
] as const;

export const QueueView: React.FC<QueueViewProps> = ({
  conversations,
  onSelectConversation
}) => {
  const { assignments, loading, error, updateAssignment } = useConversationAssignments();

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const contactId = draggableId;
    const newStatus = destination.droppableId as 'aguardando' | 'em_atendimento' | 'aguardando_retorno' | 'finalizado';
    
    // Encontrar ou criar assignment
    const existingAssignment = assignments.find(a => a.contact_id === contactId);
    
    if (existingAssignment) {
      await updateAssignment(existingAssignment.id, { status: newStatus });
    } else {
      // Criar novo assignment se não existir
      // Esta lógica pode ser implementada mais tarde
    }
  };

  const getConversationsByStatus = (status: string) => {
    return conversations.filter(conv => {
      const assignment = assignments.find(a => a.contact_id === conv.contact.id_contact);
      return assignment ? assignment.status === status : status === 'aguardando';
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="h-full bg-background p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 h-full">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              conversations={getConversationsByStatus(column.id)}
              assignments={assignments}
              onSelectConversation={onSelectConversation}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};