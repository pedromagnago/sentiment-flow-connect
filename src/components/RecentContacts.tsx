
import { Phone, Mail, MessageCircle } from 'lucide-react';

const contacts = [
  { id: 1, name: 'Ana Silva', status: 'Positivo', lastContact: '2 horas', sentiment: 'positive' },
  { id: 2, name: 'Carlos Santos', status: 'Neutro', lastContact: '5 horas', sentiment: 'neutral' },
  { id: 3, name: 'Maria Oliveira', status: 'Positivo', lastContact: '1 dia', sentiment: 'positive' },
  { id: 4, name: 'João Pereira', status: 'Negativo', lastContact: '2 dias', sentiment: 'negative' },
  { id: 5, name: 'Lucia Costa', status: 'Positivo', lastContact: '3 dias', sentiment: 'positive' }
];

export const RecentContacts = () => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {contact.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{contact.name}</p>
              <p className="text-sm text-gray-500">Último contato: {contact.lastContact}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(contact.sentiment)}`}>
              {contact.status}
            </span>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-200 rounded">
                <Phone className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <Mail className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
