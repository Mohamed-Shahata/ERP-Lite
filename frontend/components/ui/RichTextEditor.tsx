"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  run: () => void;
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/**
 * Minimal WYSIWYG editor built on contentEditable + execCommand — no
 * external dependency. Only exposes formatting the backend's sanitize-html
 * whitelist actually allows (see content-pages.service.ts), so nothing an
 * admin creates here can get silently stripped on save.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const { t, dir } = useTranslations();
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Only push external value changes into the DOM once (e.g. when a
  // different page loads). After that, the DOM is the source of truth so
  // we don't fight the user's cursor position on every keystroke.
  useEffect(() => {
    if (editorRef.current && isFirstRender.current) {
      editorRef.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(command: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handleLink() {
    const url = window.prompt(t("contentPages.editor.linkPrompt"));
    if (!url) return;
    exec("createLink", url);
  }

  const buttons: ToolbarButton[] = [
    {
      label: t("contentPages.editor.bold"),
      icon: <Icon d="M6 4.5h6a3.25 3.25 0 0 1 0 6.5H6zM6 11h7a3.25 3.25 0 0 1 0 6.5H6z" />,
      run: () => exec("bold"),
    },
    {
      label: t("contentPages.editor.italic"),
      icon: <Icon d="M10 4.5h7M7 19.5h7M14 4.5 10 19.5" />,
      run: () => exec("italic"),
    },
    {
      label: t("contentPages.editor.underline"),
      icon: <Icon d="M6 4.5V11a6 6 0 0 0 12 0V4.5M5 19.5h14" />,
      run: () => exec("underline"),
    },
    {
      label: t("contentPages.editor.strike"),
      icon: <Icon d="M5 12h14M8 6.5c0-1.5 1.8-2.5 4-2.5s4 1 4 2.5M16 17.5c0 1.5-1.8 2.5-4 2.5s-4-1-4-2.5" />,
      run: () => exec("strikeThrough"),
    },
    {
      label: t("contentPages.editor.heading2"),
      icon: <Icon d="M4 5v14M11 5v14M4 12h7M15 9.5V9a1.5 1.5 0 0 1 3 0c0 1.2-3 2-3 4.5h3.2" />,
      run: () => exec("formatBlock", "h2"),
    },
    {
      label: t("contentPages.editor.heading3"),
      icon: <Icon d="M4 5v14M11 5v14M4 12h7M15.3 9a1.5 1.5 0 0 1 2.7.9c0 .9-.8 1.3-1.5 1.5.9.1 1.8.6 1.8 1.6a1.7 1.7 0 0 1-3 1.1" />,
      run: () => exec("formatBlock", "h3"),
    },
    {
      label: t("contentPages.editor.bulletList"),
      icon: <Icon d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
      run: () => exec("insertUnorderedList"),
    },
    {
      label: t("contentPages.editor.numberList"),
      icon: <Icon d="M9 6h11M9 12h11M9 18h11M4 5.5h1V9M4 9h2M4.5 14.5h1.4c.6 0 1.1.4 1.1 1s-.5 1-1.1 1H4.5m0 1.5h2c.6 0 1-.4 1-1" />,
      run: () => exec("insertOrderedList"),
    },
    {
      label: t("contentPages.editor.quote"),
      icon: <Icon d="M7.5 6.5c-2 1-3 2.8-3 5v6h5v-5H7c0-1.6.8-2.8 2-3.5zM17 6.5c-2 1-3 2.8-3 5v6h5v-5h-2.5c0-1.6.8-2.8 2-3.5z" />,
      run: () => exec("formatBlock", "blockquote"),
    },
    {
      label: t("contentPages.editor.link"),
      icon: <Icon d="M9.5 14.5 14.5 9.5M8 16 6 18a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0M16 8l2-2a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0" />,
      run: handleLink,
    },
    {
      label: t("contentPages.editor.hr"),
      icon: <Icon d="M4 12h16" />,
      run: () => exec("insertHorizontalRule"),
    },
    {
      label: t("contentPages.editor.clear"),
      icon: <Icon d="M6 6.5 18 17.5M9 6.5h9v3M6 10v9h9" />,
      run: () => exec("removeFormat"),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
        {/* eslint-disable-next-line react-hooks/refs -- button.run only touches editorRef inside onClick, not during render */}
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={button.run}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {button.icon}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        dir={dir}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="content-page-editor min-h-[240px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none dark:text-slate-100 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:border-slate-300 [&_blockquote]:ps-3 [&_blockquote]:text-slate-500 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_hr]:border-slate-300 [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5"
      />
      <style jsx global>{`
        .content-page-editor:empty::before {
          content: attr(data-placeholder);
          color: rgb(148 163 184);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
