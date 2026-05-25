"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Quill touches `document` at import time, so it must never run during SSR.
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[164px] rounded-xl border border-gray-200 bg-white" />
  ),
});

// Kept intentionally small so the stored HTML stays to a safe, simple tag set
// (matches the format the admin + city-site renderers already expect).
const modules = {
  toolbar: [
    ["bold", "italic"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = ["bold", "italic", "list", "link"];

interface Props {
  value: string;
  onChange: (html: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, hasError, placeholder }: Props) {
  return (
    <div className={`rte ${hasError ? "rte-error" : ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
