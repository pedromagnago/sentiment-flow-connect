import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from '../kanban/KanbanColumn';
import { ConversationCard } from '../kanban/ConversationCard';
import { ConversationStats } from '../ConversationStats';
import { useConversationAssignments } from '@/hooks/useConversationAssignments';
import { useCompanyId } from '@/hooks/useCompanyId';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import type { Conversation } from '../WhatsAppInterface';

interface QueueViewProps {
  conversations: Conversation[];
  onSelectConversation: (contactId: string | null) => void;
}

const statusColumns = [
  { id: 'disponivel', title: 'Disponíveis', color: 'bg-slate-100 border-slate-300' },
  { id: 'aguardando', title: 'Aguardando', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'bg-blue-100 border-blue-300' },
  { id: 'aguardando_retorno', title: 'Aguardando Retorno', color: 'bg-orange-100 border-orange-300' },
  { id: 'finalizado', title: 'Finalizado', color: 'bg-green-100 border-green-300' }
] as const;

export const QueueView: React.FC<QueueViewProps> = ({
  conversations,
  onSelectConversation
}) => {
  const { assignments, loading, error, updateAssignment, createAssignment } = useConversationAssignments();
  const { companyId } = useCompanyId();

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const contactId = draggableId;
    const newStatus = destination.droppableId as 'disponivel' | 'aguardando' | 'em_atendimento' | 'aguardando_retorno' | 'finalizado';
    
    // Encontrar assignment existente
    const existingAssignment = assignments.find(a => a.contact_id === contactId);
    
    if (newStatus === 'disponivel') {
      // Se movendo para "disponível", remover assignment (não implementado aqui)
      console.log('Moving to available - assignment removal not implemented');
      return;
    }
    
    if (existingAssignment) {
      await updateAssignment(existingAssignment.id, { status: newStatus });
    } else {
      // Criar novo assignment
      await createAssignment({
        contact_id: contactId,
        status: newStatus,
        priority: 'media',
        tags: [],
        user_id: null, // Will be filled by the server
        sla_deadline: null
      });
    }
  };

  const getConversationsByStatus = (status: string) => {
    return conversations.filter(conv => {
      const assignment = assignments.find(a => a.contact_id === conv.contact.id_contact);
      
      if (status === 'disponivel') {
        // Show conversations without assignments
        return !assignment;
      }
      
      return assignment ? assignment.status === status : false;
    });
  };

  const handleAssumeConversation = async (contactId: string) => {
    try {
      await createAssignment({
        contact_id: contactId,
        status: 'em_atendimento',
        priority: 'media',
        tags: [],
        user_id: null, // Will be filled by the server with auth.uid()
        sla_deadline: null
      });
    } catch (error) {
      console.error('Error assuming conversation:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <ConversationStats 
        conversations={conversations}
        assignments={assignments}
        companyId={companyId}
      />
      <div className="flex-1 p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-5 gap-4 h-full">
            {statusColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                conversations={getConversationsByStatus(column.id)}
                assignments={assignments}
                onSelectConversation={onSelectConversation}
                onAssumeConversation={column.id === 'disponivel' ? handleAssumeConversation : undefined}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};