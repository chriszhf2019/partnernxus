import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GlobalConfig } from '../types';
import { configService } from '../services/config-service';

interface ConfigContextType {
  config: GlobalConfig;
  updateConfig: (newConfig: Partial<GlobalConfig>) => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(configService.getDefaultConfig());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = configService.subscribe(
      (data) => {
        setConfig(data);
        setIsLoading(false);
      },
      (error) => {
        console.error('Config subscription error:', error);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<GlobalConfig>) => {
    await configService.update(config, newConfig);
  }, [config]);

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
