'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';

interface KeycloakContextValue {
  keycloak: Keycloak.KeycloakInstance | null;
  initialized: boolean;
}

const KeycloakContext = createContext<KeycloakContextValue>({ keycloak: null, initialized: false });

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [keycloak, setKeycloak] = useState<Keycloak.KeycloakInstance | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const kc = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL as string,
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM as string,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID as string,
    });
    kc
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(() => {
        setKeycloak(kc);
        setInitialized(true);
      })
      .catch(() => {
        // Init failed – still mark as initialized to avoid blocking UI
        setInitialized(true);
      });
  }, []);

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);
