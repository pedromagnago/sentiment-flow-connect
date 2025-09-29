import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContacts } from '@/hooks/useContacts';
import type { Contact } from '../WhatsAppInterface';

interface ContactsViewProps {
  onSelectContact: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onSelectContact }) => {
  const { contacts, loading, error } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.id_contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'todos' || 
      (filterBy === 'ativo' && contact.status) ||
      (filterBy === 'inativo' && !contact.status);
    
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando contatos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-destructive">
          <p>Erro ao carregar contatos: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Contatos</h2>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id_contact}
              className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onSelectContact(contact)}
            >
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(contact.nome)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">
                    {contact.nome || 'Contato sem nome'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={contact.status ? "default" : "secondary"}>
                      {contact.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {contact.is_group && (
                      <Badge variant="outline">Grupo</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="truncate">{contact.id_contact}</span>
                  <span>{formatDate(contact.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum contato encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};