"use client";

import * as React from "react";
import { TranslationMethodModal } from "./TranslationMethodModal";

export interface OpenModalOptions {
  preselectedMethod?: "automated" | "certified";
  targetQuery?: Record<string, string | number | boolean>;
}

export interface TranslationModalContextType {
  isOpen: boolean;
  openModal: (options?: OpenModalOptions) => void;
  closeModal: () => void;
  toggleModal: () => void;
  modalOptions?: OpenModalOptions;
}

const defaultContext: TranslationModalContextType = {
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  toggleModal: () => {},
};

export const TranslationModalContext =
  React.createContext<TranslationModalContextType>(defaultContext);

export function useTranslationModal(): TranslationModalContextType {
  const context = React.useContext(TranslationModalContext);
  return context || defaultContext;
}

export function TranslationModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalOptions, setModalOptions] = React.useState<OpenModalOptions | undefined>(undefined);

  const openModal = React.useCallback((options?: OpenModalOptions) => {
    setModalOptions(options);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    setModalOptions(undefined);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Sitewide trigger integration: Custom event and delegated click handling
  React.useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      const customEvent = event as CustomEvent<OpenModalOptions>;
      openModal(customEvent.detail);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest(
        "[data-start-translation-trigger]"
      );
      if (target) {
        // If the target explicitly links to /translate, allow direct navigation
        const href = target.getAttribute("href");
        if (href && (href === "/translate" || href.startsWith("/translate?") || href.startsWith("/translate/"))) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        openModal();
      }
    };

    window.addEventListener("open-translation-modal", handleOpenEvent);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      window.removeEventListener("open-translation-modal", handleOpenEvent);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [openModal]);

  return (
    <TranslationModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        toggleModal,
        modalOptions,
      }}
    >
      {children}
      <TranslationMethodModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setIsOpen(true);
          }
        }}
        options={modalOptions}
      />
    </TranslationModalContext.Provider>
  );
}
