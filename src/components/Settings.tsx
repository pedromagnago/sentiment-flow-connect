import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Link, Shield, Bell, User, Sparkles, MessageSquare, UserCheck, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClickUpSettings } from './settings/ClickUpSettings';
import { UserProfile } from './settings/UserProfile';
import { AISettings } from './settings/AISettings';
import { ZAPISettings } from './settings/ZAPISettings';
import { HITLSettings } from './settings/HITLSettings';
import { CompanySettings } from './settings/CompanySettings';

export const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>IA & HITL</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Integrações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile />
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6">
            <AISettings />
            <HITLSettings />
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            <ZAPISettings />
            <ClickUpSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};