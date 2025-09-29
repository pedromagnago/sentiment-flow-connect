import React, { useState } from 'react';
import { User, Phone, Mail, Building2, Tag, Clock, Star, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Contact, Conversation } from './WhatsAppInterface';
import { useToast } from '@/hooks/use-toast';

interface ContactInfoProps {
  contact: Contact;
  conversation: Conversation;
}

export const ContactInfo = ({ contact, conversation }: ContactInfoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editedContact, setEditedContact] = useState(contact);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: Implementar salvamento das alterações
    setIsEditing(false);
    toast({
      title: 'Contato atualizado',
      description: 'As informações do contato foram salvas com sucesso',
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    // TODO: Implementar adição de tag
    setNewTag('');
    toast({
      title: 'Tag adicionada',
      description: `Tag "${newTag}" foi adicionada ao contato`,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    // TODO: Implementar mudança de status
    toast({
      title: 'Status atualizado',
      description: `Status alterado para ${newStatus}`,
    });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-red-100 text-red-800';
      case 'em_atendimento': return 'bg-yellow-100 text-yellow-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex flex-col h-full border-l border-border bg-card shadow-sm transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && <h3 className="font-semibold">Informações do Contato</h3>}
          <div className="flex gap-1 ml-auto">
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expandir' : 'Minimizar'}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Avatar e nome */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">
                  {contact.nome || contact.id_contact}
                </h4>
                <p className="text-sm text-muted-foreground">
                  ID: {contact.id_contact}
                </p>
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                {isEditing ? (
                  <Select defaultValue={conversation.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aguardando">Aguardando</SelectItem>
                      <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                    {conversation.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${
                    conversation.priority === 'alta' ? 'text-red-500' : 
                    conversation.priority === 'media' ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                  <span className="text-sm capitalize">{conversation.priority}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conteúdo principal */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Informações básicas */}
        <div>
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Dados do Contato
          </h5>
          
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              {isEditing ? (
                <Input
                  value={editedContact.nome || ''}
                  onChange={(e) => setEditedContact({...editedContact, nome: e.target.value})}
                  className="h-8"
                />
              ) : (
                <p className="text-sm">{contact.nome || 'Não informado'}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <div className="flex gap-1">
                {contact.is_group && (
                  <Badge variant="outline" className="text-xs">Grupo</Badge>
                )}
                {contact.feedback && (
                  <Badge variant="outline" className="text-xs">Feedback Ativo</Badge>
                )}
                {contact.status && (
                  <Badge variant="outline" className="text-xs">Ativo</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </h5>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {conversation.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={handleAddTag}>
                  Adicionar
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Métricas */}
        <div>
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Histórico
          </h5>
          
          <div className="space-y-2 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Primeiro contato</Label>
              <p>{formatDate(contact.created_at)}</p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Última mensagem</Label>
              <p>{formatDate(conversation.lastMessage.created_at)}</p>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Mensagens não lidas</Label>
              <p>{conversation.unreadCount}</p>
            </div>
          </div>
        </div>

        {/* Empresa associada */}
        {contact.empresa_id && (
          <>
            <Separator />
            <div>
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </h5>
              <p className="text-sm">ID: {contact.empresa_id}</p>
            </div>
          </>
        )}
        </div>
      )}

      {/* Ações */}
      {!isCollapsed && isEditing && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};