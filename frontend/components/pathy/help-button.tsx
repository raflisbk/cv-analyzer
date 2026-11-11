"use client";

export interface HelpButtonProps {
  helpKey: string;
  label?: string;
}

export default function HelpButton({ helpKey, label }: HelpButtonProps) {
  return (
    <button type="button" data-help-key={helpKey} aria-label={label ?? "Help"}>
      ?
    </button>
  );
}
