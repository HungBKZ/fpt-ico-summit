"use client";

import { useEffect, useRef, useState } from "react";
import { sanitizeHtml } from "@/lib/utils/sanitizer";

interface RichTextEditorProps {
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  value,
  onChange,
  disabled = false,
  placeholder = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const initialText = value !== undefined ? value : defaultValue;
  const [htmlValue, setHtmlValue] = useState<string>(() => sanitizeHtml(initialText));

  useEffect(() => {
    const currentVal = value !== undefined ? value : defaultValue;
    if (editorRef.current && currentVal !== undefined) {
      const sanitized = sanitizeHtml(currentVal);
      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  }, [value, defaultValue]);

  const updateContent = (rawHtml: string) => {
    const clean = sanitizeHtml(rawHtml);
    setHtmlValue(clean);
    if (onChange) {
      onChange(clean);
    }
  };

  const execCmd = (command: string, val: string = "") => {
    if (disabled) return;
    document.execCommand(command, false, val);
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const handleAddLink = () => {
    if (disabled) return;
    const url = prompt("Enter URL (must start with http:// or https://):");
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      execCmd("createLink", url);
    } else if (url) {
      alert("Invalid URL. Links must start with http:// or https://");
    }
  };

  return (
    <div className={`rounded-xl border border-slate-300 bg-white overflow-hidden ${disabled ? "opacity-60 bg-slate-50 cursor-not-allowed" : "focus-within:ring-2 focus-within:ring-blue-500"}`}>
      {name && <input type="hidden" name={name} value={htmlValue} />}

      {/* Lightweight Formatting Toolbar */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 underline"
            title="Underline"
          >
            U
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1 inline-block" />

          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800"
            title="Numbered List"
          >
            1. List
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1 inline-block" />

          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<h3>")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<h4>")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
            title="Heading 4"
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => execCmd("formatBlock", "<p>")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-800 text-[11px]"
            title="Normal Paragraph"
          >
            Paragraph
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1 inline-block" />

          <button
            type="button"
            onClick={handleAddLink}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-blue-600 font-semibold"
            title="Add Link"
          >
            🔗 Link
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1 inline-block" />

          <button
            type="button"
            onClick={() => execCmd("undo")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-600 text-[10px]"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={() => execCmd("redo")}
            className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-600 text-[10px]"
            title="Redo"
          >
            ↪ Redo
          </button>
        </div>
      )}

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        aria-placeholder={placeholder}
        className="p-3 min-h-[100px] max-h-[300px] overflow-y-auto outline-none text-xs text-slate-900 leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:text-sm [&>h4]:font-bold [&>h4]:text-slate-900 [&>h4]:text-xs [&>a]:text-blue-600 [&>a]:underline"
      />
    </div>
  );
}
