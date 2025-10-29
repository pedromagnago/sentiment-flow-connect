interface Message {
  id: string;
  contact_id: string;
  conteudo_mensagem: string;
  fromme: boolean;
  created_at: string;
  nome_membro: string;
  data_hora: string;
  status_processamento: string;
  updated_at: string;
  tipo_mensagem?: string;
  link_arquivo?: string;
}

interface Contact {
  id_contact: string;
  nome?: string;
  status?: boolean;
  company_id?: string;
  feedback?: boolean;
  is_group?: boolean;
  data_criacao?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  contact: Contact;
  lastMessage: Message;
  unreadCount: number;
  status: 'aguardando' | 'em_atendimento' | 'finalizado' | 'aguardando_retorno';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
}

self.onmessage = (e: MessageEvent) => {
  const { messages, contacts } = e.data;
  
  // Processar conversas de forma otimizada
  const contactsMap = new Map<string, Contact>(contacts.map((c: Contact) => [c.id_contact, c]));
  const conversationsMap = new Map<string, Conversation>();
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  messages.forEach((message: Message) => {
    const contact = contactsMap.get(message.contact_id);
    if (!contact) return;

    const existing = conversationsMap.get(message.contact_id);
    const messageTime = new Date(message.created_at).getTime();
    
    if (!existing || messageTime > new Date(existing.lastMessage.created_at).getTime()) {
      conversationsMap.set(message.contact_id, {
        contact,
        lastMessage: message,
        unreadCount: existing?.unreadCount || 0,
        status: existing?.status || 'aguardando',
        priority: existing?.priority || 'media',
        tags: existing?.tags || []
      });
    }

    if (!message.fromme && messageTime > dayAgo) {
      const conv = conversationsMap.get(message.contact_id)!;
      conv.unreadCount++;
    }
  });

  const conversations = Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

  self.postMessage(conversations);
};
