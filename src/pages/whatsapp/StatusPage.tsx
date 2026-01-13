import React from 'react';
import { useZAPIStatus } from '@/hooks/useZAPIStatus';
import { ConnectionStatus } from '@/components/whatsapp/status/ConnectionStatus';
import { StatsCards } from '@/components/whatsapp/status/StatsCards';
import { MessageVolumeChart } from '@/components/whatsapp/status/MessageVolumeChart';
import { ClassificationProgress } from '@/components/whatsapp/status/ClassificationProgress';
import { RecentMessagesList } from '@/components/whatsapp/status/RecentMessagesList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { useNavigate } from 'react-router-dom';

export default function StatusPage() {
  const { stats, loading, error, refetch } = useZAPIStatus();
  const navigate = useNavigate();

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !stats) {
    return <ErrorState message={error} />;
  }

  const lastMessageTime = stats?.recentMessages?.[0]?.data_hora || null;
  const isConnected = lastMessageTime 
    ? new Date(lastMessageTime).getTime() > Date.now() - 24 * 60 * 60 * 1000
    : false;

  const handleMessageClick = (contactId: string) => {
    navigate('/whatsapp/chats', { state: { selectedContact: contactId } });
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        lastUpdate={lastMessageTime}
        onRefresh={refetch}
        loading={loading}
      />

      {/* Stats Cards */}
      {stats && (
        <StatsCards
          totalMessages={stats.totalMessages}
          messagesLast24h={stats.messagesLast24h}
          messagesLast7d={stats.messagesLast7d}
          messagesLast30d={stats.messagesLast30d}
        />
      )}

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        {stats && <MessageVolumeChart data={stats.messagesByDay} />}

        {/* Classification Progress */}
        {stats && (
          <ClassificationProgress
            totalContacts={stats.totalContacts}
            classifiedContacts={stats.classifiedContacts}
            unclassifiedContacts={stats.unclassifiedContacts}
            groups={stats.groups}
            individuals={stats.individuals}
          />
        )}
      </div>

      {/* Recent Messages */}
      {stats && (
        <RecentMessagesList
          messages={stats.recentMessages}
          onMessageClick={handleMessageClick}
        />
      )}
    </div>
  );
}
