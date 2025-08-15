import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
        setPageWidth(containerWidth - 48); // Account for padding
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    console.error('PDF load error:', error);
  };

  const zoomIn = () => setPageWidth(prev => Math.min(prev * 1.2, 1200));
  const zoomOut = () => setPageWidth(prev => Math.max(prev * 0.8, 300));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg border", className)}>
        <div className="text-center p-8">
          <div className="text-destructive mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative h-full bg-gradient-to-br from-background to-muted/20 rounded-lg border shadow-lg overflow-hidden", className)}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-md rounded-lg p-2 shadow-lg border">
        <Button variant="ghost" size="sm" onClick={zoomOut} className="h-8 w-8 p-0">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={zoomIn} className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={rotate} className="h-8 w-8 p-0">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">Loading PDF...</p>
          <div className="space-y-2 w-full max-w-md">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {/* PDF Document */}
      <ScrollArea className="h-full">
        <div className="p-6 space-y-4">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="flex flex-col items-center"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-4 shadow-lg rounded-lg overflow-hidden border bg-white">
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  rotate={rotation}
                  className="mx-auto"
                  loading={
                    <div className="flex items-center justify-center" style={{ width: pageWidth, height: pageWidth * 1.4 }}>
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