"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ Use the official PDF worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export interface PdfScrollViewerProps {
  url: string;
  className?: string;
}

const PdfScrollViewerBase: React.FC<PdfScrollViewerProps> = ({ url, className }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);

  useEffect(() => {
    // Dynamically adjust width for responsiveness
    const handleResize = () => {
      const containerWidth = window.innerWidth > 900 ? 800 : window.innerWidth - 40;
      setPageWidth(containerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className={cn("overflow-y-auto bg-transparent rounded-xl p-4", className)}>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-64">
            <Skeleton className="w-full h-full" />
          </div>
        }
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-6">
            <Page
              pageNumber={index + 1}
              width={pageWidth}
              scale={1.5} // 🔹 Higher quality rendering
              renderTextLayer={false} // 🔹 Hides OCR text layer
              renderAnnotationLayer={false} // 🔹 Hides clickable annotations
              className="mx-auto shadow-xl rounded-lg overflow-hidden"
              loading={
                <div
                  className="flex items-center justify-center"
                  style={{ width: pageWidth, height: pageWidth * 1.4 }}
                >
                  <Skeleton className="w-full h-full" />
                </div>
              }
            />
          </div>
        ))}
      </Document>
    </div>
  );
};

// ✅ Memoized to prevent lag from unnecessary re-renders
export const PdfScrollViewer = React.memo(PdfScrollViewerBase);
