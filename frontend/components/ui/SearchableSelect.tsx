"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/lib/i18n/use-translations";

export interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  id?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
}

/**
 * A dropdown with a built-in search box, used anywhere a plain <select>
 * would otherwise force people to scroll through a long, unfiltered list
 * (suppliers, customers, products in the sales/purchase order forms).
 *
 * The options panel is rendered through a portal into document.body and
 * positioned with `fixed` coordinates computed from the trigger button.
 * This is deliberate: when the trigger sits inside a scrollable/clipping
 * ancestor (e.g. a table wrapper with `overflow-x-auto`, or a card with
 * `overflow-hidden`), a normal `absolute` panel gets visually clipped or
 * hidden behind later content no matter how high its z-index is. Portaling
 * to <body> escapes every ancestor's overflow/stacking context, so the
 * list always renders fully on top.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}: SearchableSelectProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.id === value) ?? null;

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.sublabel?.toLowerCase().includes(q),
    );
  }, [options, query]);

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }

  function openDropdown() {
    updatePosition();
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden input keeps native `required` form validation working. */}
      <input
        aria-hidden
        className="sr-only"
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        value={value}
      />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 text-sm text-start outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <span
          className={
            selected
              ? "truncate text-slate-900 dark:text-white"
              : "truncate text-slate-400 dark:text-slate-500"
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4 shrink-0 text-slate-400"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="border-b border-slate-200 p-2 dark:border-slate-800">
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
                  {t("common.noResults")}
                </li>
              ) : (
                filteredOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full flex-col px-3 py-2 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        option.id === value
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.sublabel && (
                        <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {option.sublabel}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
