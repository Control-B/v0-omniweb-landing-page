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
  const [initialized, setInitialized] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

    // Do not initialize if configuration is missing
    if (!url || !realm || !clientId) {
      setInitialized(true);
      return;
    }

    try {
      const kc = new Keycloak({ url, realm, clientId });
      kc
        .init({ onLoad: 'check-sso', checkLoginIframe: false })
        .then(() => {
          setKeycloak(kc);
          setInitialized(true);
        })
        .catch((err) => {
          console.warn('Keycloak initialization skipped or failed:', err);
          setInitialized(true);
        });
    } catch (e) {
      console.warn('Keycloak client setup failed:', e);
      setInitialized(true);
    }
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => useContext(KeycloakContext);
