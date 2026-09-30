'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoginRequiredModalContextType {
  isOpen: boolean;
  message: string;
  openModal: (message?: string) => void;
  closeModal: () => void;
}

const LoginRequiredModalContext = createContext<LoginRequiredModalContextType>({
  isOpen: false,
  message: '',
  openModal: () => {},
  closeModal: () => {},
});

export function LoginRequiredModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(
    'You need to log in to use personalized recommendations, watchlists and AI features.',
  );

  const openModal = (customMessage?: string) => {
    if (customMessage) setMessage(customMessage);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleLoginRequiredEvent = (event: any) => {
      const msg =
        event.detail?.message ||
        'You need to log in to use personalized recommendations, watchlists and AI features.';
      openModal(msg);
    };

    window.addEventListener('auth:login-required', handleLoginRequiredEvent);
    return () => {
      window.removeEventListener('auth:login-required', handleLoginRequiredEvent);
    };
  }, []);

  return (
    <LoginRequiredModalContext.Provider
      value={{ isOpen, message, openModal, closeModal }}
    >
      {children}
    </LoginRequiredModalContext.Provider>
  );
}

export const useLoginRequired = () => useContext(LoginRequiredModalContext);
