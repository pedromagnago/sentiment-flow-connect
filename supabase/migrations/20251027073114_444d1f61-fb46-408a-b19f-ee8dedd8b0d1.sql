-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Create indexes
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins and owners can view all invitations"
ON team_invitations FOR SELECT
USING (
  has_role(auth.uid(), 'owner') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and owners can create invitations"
ON team_invitations FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin'))
  AND auth.uid() = invited_by
);

CREATE POLICY "Admins and owners can update invitations"
ON team_invitations FOR UPDATE
USING (
  has_role(auth.uid(), 'owner') OR 
  has_role(auth.uid(), 'admin')
);

-- Allow anyone to view their own invitation by token (for accept page)
CREATE POLICY "Anyone can view invitation by token"
ON team_invitations FOR SELECT
USING (true);