"use client";

import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CornerDownLeft,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorToolbarProps {
  editor: Editor;
  isFocused: boolean;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
          className={`h-7 w-7 p-0 ${
            active
              ? "bg-[#141414] text-[#F5F2D8] hover:bg-[#141414]/90"
              : "text-[#141414]/65 hover:bg-[#141414]/8 hover:text-[#141414]"
          }`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({ editor, isFocused }: EditorToolbarProps) {
  // useEditorState for selective re-renders — NOT shouldRerenderOnTransaction (v3 API per RESEARCH.md)
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive("bold"),
      isItalic: e.isActive("italic"),
      isBulletList: e.isActive("bulletList"),
      isOrderedList: e.isActive("orderedList"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  return (
    // Toolbar slides in on focus — transition-opacity per UI-SPEC animation contract
    // onMouseDown preventDefault prevents editor blur when clicking toolbar buttons
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={`flex h-10 items-center gap-0.5 border-b border-border px-2 transition-opacity duration-150 ease-in-out ${
        isFocused ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isFocused}
    >
      <TooltipProvider delayDuration={400}>
        <ToolbarButton
          label="Bold"
          active={state?.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={state?.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarButton
          label="Bullet list"
          active={state?.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={state?.isOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Hard break"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <CornerDownLeft className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarButton
          label="Undo"
          disabled={!state?.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!state?.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </TooltipProvider>
    </div>
  );
}
