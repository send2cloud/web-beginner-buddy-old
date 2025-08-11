import React from 'react';

interface AuthV2Props {
  children: React.ReactNode;
}

export const AuthV2: React.FC<AuthV2Props> = ({ children }) => {
  // Simple wrapper - no authentication needed for V2
  return <>{children}</>;
};