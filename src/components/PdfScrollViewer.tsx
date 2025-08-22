import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Configure PDF.js worker with local fallback
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfScrollViewerProps {
  url: string;
  className?: string;
}

export function PdfScrollViewer({ url, className }: PdfScrollViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setPageWidth(Math.max(300, Math.min(containerWidth - 48, 1200))); // padding accounted
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    setError("Failed to load PDF document");
    setLoading(false);
    console.error("PDF load error:", err);
  };

  const zoomIn = () => setPageWidth((prev) => Math.min(prev * 1.15, 1400));
  const zoomOut = () => setPageWidth((prev) => Math.max(prev * 0.85, 300));
  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg border",
          className
        )}
      >
        <div className="text-center p-8 space-y-4">
          <div className="text-destructive mb-2 text-2xl">⚠️</div>
          <div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(url, '_blank')}
              className="mr-2"
            >
              Open in New Tab
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full bg-gradient-to-br from-background to-muted/20 rounded-lg border shadow-lg overflow-hidden",
        "pdf-backdrop",
        className
      )}
    >
      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-md rounded-xl p-2 shadow-lg border">
        <Button variant="ghost" size="sm" onClick={zoomOut} className="h-8 w-8 p-0 rounded-lg">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={zoomIn} className="h-8 w-8 p-0 rounded-lg">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={rotate} className="h-8 w-8 p-0 rounded-lg">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading PDF…</p>
          <div className="space-y-2 w-full max-w-md">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {/* Document */}
      <ScrollArea className="h-full">
        <div className="p-6 space-y-4 snap-y snap-mandatory">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex flex-col items-center"
            loading=""
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-4 shadow-xl rounded-2xl overflow-hidden border bg-white snap-start page-wrap"
              >
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  rotate={rotation}
                  renderTextLayer={false}         // 🚫 no text layer (no OCR look)
                  renderAnnotationLayer={false}   // 🚫 no annotations
                  className="mx-auto"
                  loading={
                    <div
                      className="flex items-center justify-center bg-white"
                      style={{ width: pageWidth, height: pageWidth * 1.35 }}
                    >
                      <Skeleton className="w-full h-full" />
                    </div>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </ScrollArea>
    </div>
  );
}
