
// ===============================
// File: src/components/PdfScrollViewer.tsx
// Drop-in replacement that hides OCR/text layers & annotations by default,
// and renders a smooth, scrollable multi-page PDF.
// Uses react-pdf. Ensure you have these deps installed:
//   npm i react-pdf pdfjs-dist
//   // And in your app entry, configure workerSrc if needed.
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// If you haven't configured globally, uncomment and set workerSrc:
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfScrollViewerProps {
  url: string;
  className?: string;
  renderTextLayer?: boolean;          // default false
  renderAnnotationLayer?: boolean;    // default false
}

export const PdfScrollViewer: React.FC<PdfScrollViewerProps> = ({ url, className, renderTextLayer = false, renderAnnotationLayer = false }) => {
  const [numPages, setNumPages] = useState<number>(0);

  // Avoid re-creating options
  const options = useMemo(() => ({
    cMapUrl: undefined,
    cMapPacked: true,
  }), []);

  useEffect(() => { setNumPages(0); }, [url]);

  return (
    <div className={cn("w-full h-full overflow-auto px-4 py-6 space-y-6 bg-background", className)}>
      <Document
        file={url}
        options={options as any}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(e) => console.error("PDF load error", e)}
        loading={<div className="p-8 text-center text-sm text-muted-foreground">Loading PDF…</div>}
        error={<div className="p-8 text-center text-sm text-destructive">Failed to load PDF</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <div key={i} className="mx-auto max-w-4xl rounded-xl overflow-hidden shadow-md bg-white">
            <Page
              pageNumber={i + 1}
              renderTextLayer={renderTextLayer}
              renderAnnotationLayer={renderAnnotationLayer}
              width={800}
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

// tiny cn helper if not globally available here
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
