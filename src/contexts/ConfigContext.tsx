import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalConfig } from '../types';
import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ConfigContextType {
  config: GlobalConfig;
  updateConfig: (newConfig: Partial<GlobalConfig>) => Promise<void>;
  isLoading: boolean;
}

const defaultConfig: GlobalConfig = {
  sections: {
    revenueAlignment: true,
    partnershipMatrix: true,
    ecosystemNetwork: true,
    mdfEfficiency: true,
  },
  partnerTiers: ['Platinum', 'Gold', 'Silver', 'Registered', 'Diamond'],
  salesStages: ['1. 需求发现', '2. 方案阶段', '3. 商务洽谈', '4. 合同签约', '5. 售后回访'],
  industries: ['金融', '医疗', '政务', '制造', '教育'],
  regions: ['华北', '华东', '华南', '西部'],
  currency: 'CNY',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const configDoc = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(configDoc, (snapshot) => {
          if (snapshot.exists()) {
            setConfig(snapshot.data() as GlobalConfig);
          } else {
            // Initialize with default if it doesn't exist
            setDoc(configDoc, defaultConfig).catch(e => handleFirestoreError(e, OperationType.WRITE, 'settings/global'));
          }
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, 'settings/global');
        });

        return () => unsubscribe();
      } else {
        setConfig(defaultConfig);
        setIsLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  const updateConfig = async (newConfig: Partial<GlobalConfig>) => {
    const configDoc = doc(db, 'settings', 'global');
    const updated = { ...config, ...newConfig };
    try {
      await setDoc(configDoc, updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
