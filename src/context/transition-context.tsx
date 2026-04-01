import type { BookmarkTransitionHandle } from "@/src/components/bookmarktransitionoverlay";
import React, { createContext, useContext, useRef } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";

type TransitionContextType = {
  progress: SharedValue<number>;
  overlayRef: React.RefObject<BookmarkTransitionHandle | null>;
};

const TransitionContext = createContext<TransitionContextType | null>(null);

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const progress = useSharedValue(0);
  const overlayRef = useRef<BookmarkTransitionHandle | null>(null);

  return (
    <TransitionContext.Provider value={{ progress, overlayRef }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx)
    throw new Error("useTransition must be used inside TransitionProvider");
  return ctx;
}
