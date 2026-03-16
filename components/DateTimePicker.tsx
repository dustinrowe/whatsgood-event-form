"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: string; // "YYYY-MM-DDTHH:mm" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  primaryColor?: string;
  minDate?: string; // "YYYY-MM-DD" — days before this are greyed out and unselectable
  dateOnly?: boolean; // skip time step, store time as 00:00
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildTimes(): { label: string; value: string }[] {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      times.push({ label, value });
    }
  }
  return times;
}

const TIMES = buildTimes();

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [datePart, timePart] = dateStr.split("T");
  if (!datePart) return "";
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const monthName = MONTHS[date.getMonth()].slice(0, 3);
  const displayDate = `${monthName} ${day}, ${year}`;
  if (!timePart) return displayDate;
  const [h, m] = timePart.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${displayDate}  ${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  hasError,
  primaryColor = "#3B82F6",
  minDate,
  dateOnly = false,
}: Props) {
  const today = new Date();

  // Parse current value
  const parsedDate = value ? value.split("T")[0] : null;
  const parsedTime = value ? (value.split("T")[1] || null) : null;
  const [selYear, selMonth, selDay] = parsedDate
    ? parsedDate.split("-").map(Number)
    : [null, null, null];

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"date" | "time">("date");
  const [viewYear, setViewYear] = useState(selYear ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selMonth != null ? selMonth - 1 : today.getMonth());

  const containerRef = useRef<HTMLDivElement>(null);
  const timeListRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setStep("date");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Scroll selected time into view when time step opens
  useEffect(() => {
    if (step === "time" && timeListRef.current && parsedTime) {
      const idx = TIMES.findIndex(t => t.value === parsedTime);
      if (idx >= 0) {
        const item = timeListRef.current.children[idx] as HTMLElement;
        item?.scrollIntoView({ block: "center" });
      }
    }
  }, [step, parsedTime]);

  function openPicker() {
    // Reset view to selected date or today
    setViewYear(selYear ?? today.getFullYear());
    setViewMonth(selMonth != null ? selMonth - 1 : today.getMonth());
    setStep("date");
    setOpen(true);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const datePart = `${viewYear}-${mm}-${dd}`;
    if (dateOnly) {
      onChange(`${datePart}T00:00`);
      setOpen(false);
      setStep("date");
      return;
    }
    const timePart = parsedTime || "12:00";
    onChange(`${datePart}T${timePart}`);
    setStep("time");
  }

  function selectTime(timeVal: string) {
    const datePart = parsedDate || `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    onChange(`${datePart}T${timeVal}`);
    setOpen(false);
    setStep("date");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Disable prev-month nav when we're already at the min month
  const canGoPrev = !minDate || (
    viewYear > parseInt(minDate.slice(0, 4)) ||
    (viewYear === parseInt(minDate.slice(0, 4)) && viewMonth > parseInt(minDate.slice(5, 7)) - 1)
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        onClick={openPicker}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl text-sm cursor-pointer transition-all"
        style={{
          border: `1.5px solid ${hasError ? "#f87171" : open ? primaryColor : "#e5e7eb"}`,
          boxShadow: open ? `0 0 0 3px ${primaryColor}20` : undefined,
        }}
      >
        {/* Calendar icon */}
        <svg className="w-4 h-4 flex-shrink-0" style={{ color: value ? "#6b7280" : "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <span className={`flex-1 ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value ? (dateOnly ? formatDisplay(value).split("  ")[0] : formatDisplay(value)) : placeholder}
        </span>

        {value && (
          <button
            type="button"
            onClick={clear}
            className="flex-shrink-0 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Popover */}
      {open && (
        <div className="absolute z-30 mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ minWidth: 280 }}>

          {step === "date" && (
            <div className="p-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} disabled={!canGoPrev} className={`p-1.5 rounded-lg transition-colors ${canGoPrev ? "hover:bg-gray-100 text-gray-500" : "text-gray-200 cursor-default"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {MONTHS[viewMonth]}  {viewYear}
                </span>
                <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const mm = String(viewMonth + 1).padStart(2, "0");
                  const dd = String(day).padStart(2, "0");
                  const dayStr = `${viewYear}-${mm}-${dd}`;
                  const isSelected = dayStr === parsedDate;
                  const isToday = dayStr === todayStr;
                  const isDisabled = !!minDate && dayStr < minDate;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !isDisabled && selectDay(day)}
                      disabled={isDisabled}
                      className="aspect-square flex items-center justify-center text-sm rounded-full transition-colors mx-auto w-8 h-8"
                      style={
                        isDisabled
                          ? { color: "#d1d5db", cursor: "default" }
                          : isSelected
                          ? { backgroundColor: primaryColor, color: "#fff", fontWeight: 600 }
                          : isToday
                          ? { border: `1.5px solid ${primaryColor}`, color: primaryColor, fontWeight: 600 }
                          : { color: "#374151" }
                      }
                      onMouseEnter={e => {
                        if (!isSelected && !isDisabled) (e.currentTarget as HTMLElement).style.backgroundColor = `${primaryColor}15`;
                      }}
                      onMouseLeave={e => {
                        if (!isSelected && !isDisabled) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "time" && (
            <div>
              <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep("date")}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {parsedDate ? formatDisplay(parsedDate + "T00:00").split("  ")[0] : "Back"}
                </button>
              </div>
              <div ref={timeListRef} className="max-h-56 overflow-y-auto py-1">
                {TIMES.map(t => {
                  const isSelected = t.value === parsedTime;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => selectTime(t.value)}
                      className="w-full text-left px-5 py-2.5 text-sm transition-colors"
                      style={
                        isSelected
                          ? { backgroundColor: `${primaryColor}15`, color: primaryColor, fontWeight: 600 }
                          : { color: "#374151" }
                      }
                      onMouseEnter={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
