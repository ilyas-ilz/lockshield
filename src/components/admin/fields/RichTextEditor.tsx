"use client";

import * as React from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  FileCode,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export interface RichTextEditorProps {
  value?: JSONContent | string | null;
  onChange: (value: JSONContent | undefined) => void;
  placeholder?: string;
  minHeight?: string;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing your content…",
  minHeight = "280px",
  id,
}: RichTextEditorProps) {
  const [showSource, setShowSource] = React.useState(false);

  // Normalize initial content
  const initialContent = React.useMemo(() => {
    if (!value) return undefined;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
        };
      }
    }
    return value;
  }, [value]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--brand-red,#e01b24)] underline hover:opacity-80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4 border border-app shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4 min-h-[${minHeight}] text-foreground leading-relaxed`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      // If doc is just an empty paragraph, send undefined to preserve clean schemas
      const firstChild = json.content?.[0];
      const isEmpty =
        !json.content ||
        (json.content.length === 1 &&
          firstChild?.type === "paragraph" &&
          !firstChild.content);
      onChange(isEmpty ? undefined : json);
    },
  });

  // Keep editor content in sync when value changes externally (e.g. form reset)
  React.useEffect(() => {
    if (!editor) return;
    if (!value && editor.getText()) {
      editor.commands.setContent("");
    }
  }, [value, editor]);

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div
        className="rounded-lg border border-app bg-surface p-4 text-xs text-muted flex items-center justify-center"
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div id={id} className="rounded-lg border border-app bg-surface overflow-hidden shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-app bg-surface-2/60 p-1.5 text-app">
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarButton
            title="Bold (Ctrl+B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Italic (Ctrl+I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>

          <div className="h-4 w-px bg-border mx-1" />

          <ToolbarButton
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="size-4" />
          </ToolbarButton>

          <div className="h-4 w-px bg-border mx-1" />

          <ToolbarButton
            title="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Numbered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Code Block"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>

          <div className="h-4 w-px bg-border mx-1" />

          <ToolbarButton
            title="Insert / Edit Link"
            active={editor.isActive("link")}
            onClick={setLink}
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>

          {editor.isActive("link") && (
            <ToolbarButton
              title="Remove Link"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Unlink className="size-4 text-[var(--danger)]" />
            </ToolbarButton>
          )}

          <ToolbarButton title="Insert Image" onClick={addImage}>
            <ImageIcon className="size-4" />
          </ToolbarButton>

          <div className="h-4 w-px bg-border mx-1" />

          <ToolbarButton
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Redo (Ctrl+Y)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="size-4" />
          </ToolbarButton>
        </div>

        {/* Mode switcher: Visual vs Raw JSON */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-muted hover:text-foreground"
            onClick={() => setShowSource(!showSource)}
          >
            {showSource ? (
              <>
                <Eye className="size-3.5 mr-1" /> Visual
              </>
            ) : (
              <>
                <FileCode className="size-3.5 mr-1" /> JSON Source
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      {showSource ? (
        <div className="p-2">
          <Textarea
            className="font-mono text-xs w-full bg-surface-2"
            rows={12}
            value={value ? JSON.stringify(value, null, 2) : ""}
            onChange={(e) => {
              try {
                const parsed = e.target.value ? JSON.parse(e.target.value) : undefined;
                onChange(parsed);
                if (parsed) editor.commands.setContent(parsed);
              } catch {
                // Ignore invalid JSON while user is actively typing
              }
            }}
          />
        </div>
      ) : (
        <div
          style={{ minHeight }}
          onClick={() => editor.commands.focus()}
          className="cursor-text bg-surface"
        >
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`size-7 rounded flex items-center justify-center text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
        active
          ? "bg-[var(--brand-red,#e01b24)] text-white shadow-xs"
          : "hover:bg-surface-3 text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
