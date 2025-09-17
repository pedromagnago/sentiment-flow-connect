-- Atualizar política de SELECT para permitir que usuários autenticados vejam todas as empresas
DROP POLICY IF EXISTS "Users can view their own company" ON companies;

CREATE POLICY "Users can view all companies" 
ON companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Também vamos permitir que usuários autenticados criem empresas
DROP POLICY IF EXISTS "Admins can create companies" ON companies;

CREATE POLICY "Authenticated users can create companies" 
ON companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados atualizem empresas
DROP POLICY IF EXISTS "Users can update their own company" ON companies;

CREATE POLICY "Authenticated users can update companies" 
ON companies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados excluam empresas
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

CREATE POLICY "Authenticated users can delete companies" 
ON companies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);