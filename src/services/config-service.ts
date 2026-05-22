import { db, auth } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { GlobalConfig } from '../types';

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

export const configService = {
  getDefaultConfig: (): GlobalConfig => defaultConfig,

  subscribe: (
    onData: (config: GlobalConfig) => void,
    onError: (error: Error) => void,
  ): (() => void) => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const configDoc = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(
          configDoc,
          (snapshot) => {
            if (snapshot.exists()) {
              onData(snapshot.data() as GlobalConfig);
            } else {
              setDoc(configDoc, defaultConfig).catch(onError);
              onData(defaultConfig);
            }
          },
          onError,
        );
        return () => unsubscribe();
      } else {
        onData(defaultConfig);
      }
    });

    return () => unsubAuth();
  },

  update: async (current: GlobalConfig, partial: Partial<GlobalConfig>): Promise<void> => {
    const configDoc = doc(db, 'settings', 'global');
    await setDoc(configDoc, { ...current, ...partial });
  },
};
