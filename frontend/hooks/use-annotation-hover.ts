"use client";
/**
 * useAnnotationHover - Floating UI popover with 1.5s hover delay for annotation highlights.
 */
import { useState } from "react";
import {
  useFloating,
  useHover,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import type { Placement } from "@floating-ui/react";

interface UseAnnotationHoverOptions {
  placement?: Placement;
}

export function useAnnotationHover({
  placement = "top",
}: UseAnnotationHoverOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context, {
    delay: { open: 1500, close: 0 },
    restMs: 0,
  });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);

  return { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps };
}
