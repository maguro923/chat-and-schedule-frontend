import React, { createContext, useState, useContext } from 'react';

// Contextの型定義
interface BooleanContextInterface {
  value: boolean;
  setValue: (value: boolean) => void;
}

// Contextの初期値
const BooleanContext = createContext<BooleanContextInterface | undefined>(undefined);

// Contextのプロバイダーコンポーネント
export const BooleanProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [value, setValue] = useState<boolean>(true);

  return (
    <BooleanContext.Provider value={{ value, setValue }}>
      {children}
    </BooleanContext.Provider>
  );
};

// Contextを使用するためのカスタムフック
export const useBooleanContext = () => {
  const context = useContext(BooleanContext);
  if (!context) {
    throw new Error('useBooleanContext must be used within a BooleanProvider');
  }
  return context;
  };