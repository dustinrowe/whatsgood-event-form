"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Option {
  id: number;
  name: string;
  address?: string | null;
}

// Single-select mode
interface SingleProps {
  mode: "single";
  options: Option[];
  value: number | null;       // selected id
  onSelect: (id: number | null, name: string) => void;
  placeholder?: string;
  primaryColor?: string;
  hasError?: boolean;
}

// Multi-select mode
interface MultiProps {
  mode: "multi";
  options: Option[];
  selected: string[];          // selected names
  onChange: (selected: string[]) => void;
  placeholder?: string;
  primaryColor?: string;
  hasError?: boolean;
}

type Props = SingleProps | MultiProps;

/** Highlight matched characters in `text` for `query`. */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchableSelect(props: Props) {
  const { options, placeholder = "Search...", primaryColor = "#3B82F6", hasError } = props;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Derive display value for single mode
  const singleLabel = props.mode === "single"
    ? (props.value != null ? options.find(o => o.id === props.value)?.name ?? "" : "")
    : "";

  // Filter options by query
  const filtered = query.trim()
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        (o.address && o.address.toLowerCase().includes(query.toLowerCase()))
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // For single mode, reset query to blank (display handled by trigger)
        if (props.mode === "single") setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [props.mode]);

  function openDropdown() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // --- Single mode handlers ---
  function handleSingleSelect(opt: Option) {
    if (props.mode !== "single") return;
    props.onSelect(opt.id, opt.name);
    setQuery("");
    setOpen(false);
  }

  function handleSingleClear(e: React.MouseEvent) {
    e.stopPropagation();
    if (props.mode !== "single") return;
    props.onSelect(null, "");
    setQuery("");
  }

  // --- Multi mode handlers ---
  function toggleMulti(name: string) {
    if (props.mode !== "multi") return;
    props.onChange(
      props.selected.includes(name)
        ? props.selected.filter(s => s !== name)
        : [...props.selected, name]
    );
  }

  function removeChip(e: React.MouseEvent, name: string) {
    e.stopPropagation();
    if (props.mode !== "multi") return;
    props.onChange(props.selected.filter(s => s !== name));
  }

  const hasValue = props.mode === "single"
    ? props.value != null
    : props.selected.length > 0;

  const borderColor = hasError ? "#f87171" : open ? primaryColor : "#e5e7eb";
  const ringStyle = open ? { boxShadow: `0 0 0 3px ${primaryColor}20` } : {};

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger box */}
      <div
        onClick={openDropdown}
        className="w-full min-h-[46px] flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white rounded-xl text-sm cursor-text transition-all"
        style={{ border: `1.5px solid ${borderColor}`, ...ringStyle }}
      >
        {/* Multi: chips */}
        {props.mode === "multi" && props.selected.map(name => (
          <span
            key={name}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-white flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {name}
            <button
              type="button"
              onClick={e => removeChip(e, name)}
              className="opacity-70 hover:opacity-100 leading-none"
            >×</button>
          </span>
        ))}

        {/* Single: show selected label when closed */}
        {props.mode === "single" && !open && singleLabel && (
          <span className="flex-1 text-gray-900">{singleLabel}</span>
        )}

        {/* Search input — always visible when open, shown as placeholder trigger when closed */}
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder="Type to search..."
            className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
          />
        ) : (
          !hasValue && (
            <span className="flex-1 text-gray-400 text-sm">{placeholder}</span>
          )
        )}

        {/* Right icons */}
        <div className="flex items-center gap-1 ml-auto pl-1 flex-shrink-0">
          {hasValue && props.mode === "single" && (
            <button
              type="button"
              onClick={handleSingleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-30 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No results</div>
          ) : (
            filtered.map(opt => {
              const isSelected = props.mode === "multi"
                ? props.selected.includes(opt.name)
                : props.value === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => props.mode === "single" ? handleSingleSelect(opt) : toggleMulti(opt.name)}
                  className="w-full text-left px-4 py-2.5 transition-colors flex items-start justify-between gap-2 group"
                  style={isSelected ? { backgroundColor: `${primaryColor}10` } : {}}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={isSelected ? { color: primaryColor } : { color: "#111827" }}
                    >
                      <Highlighted text={opt.name} query={query} />
                    </div>
                    {opt.address && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        <Highlighted text={opt.address} query={query} />
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke={primaryColor} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
