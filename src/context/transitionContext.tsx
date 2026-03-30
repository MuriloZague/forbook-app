// context/TransitionContext.tsx
import React, { createContext, useContext, useRef, useCallback } from "react";

type TriggerFn = (onNavigate: () => void) => void;

const TransitionContext = createContext<{ triggerTransition: TriggerFn }>({
  triggerTransition: (cb) => cb(),
});

export const useTransition = () => useContext(TransitionContext);
export { TransitionContext };