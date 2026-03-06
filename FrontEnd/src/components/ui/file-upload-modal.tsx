import { ExternalLink, FileText, Loader2, Upload, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FileUploadModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current file URL (for displaying existing file) */
  currentFileUrl?: string | null;
  /** Current file name */
  currentFileName?: string | null;
  /** Callback when file is uploaded successfully */
  onUploadFile: (file: File) => Promise<void>;
  /** Optional callback when existing file is viewed */
  onViewCurrent?: () => void;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Title for the modal */
  title?: string;
  /** Description for the modal */
  description?: string;
}

/**
 * FileUploadModal - Modal for uploading and previewing PDF files
 *
 * Features:
 * - Only accepts PDF files
 * - Preview selected PDF file
 * - Display current file if available
 * - Loading state during upload
 * - File type validation
 */
export function FileUploadModal({
  isOpen,
  onOpenChange,
  currentFileUrl,
  currentFileName,
  onUploadFile,
  onViewCurrent,
  isUploading = false,
  title = "Upload File",
  description = "Select your file (only PDF files accepted)",
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Clear selected file function
  const clearState = React.useCallback(() => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [previewUrl]);

  // Clean up blob URL when component unmounts or when file changes
  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      clearState();
    }
  }, [isOpen, clearState]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type - only PDF allowed
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files accepted. Please select another file.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Clean up old preview
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL for PDF
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  // Handle clear button click
  const handleClear = () => {
    clearState();
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUploadFile(selectedFile);
      clearState();
      onOpenChange(false);
    } catch {
      setError("An error occurred during upload. Please try again.");
    }
  };

  // Handle view current CV
  const handleViewCurrent = () => {
    if (currentFileUrl) {
      window.open(currentFileUrl, "_blank", "noopener,noreferrer");
      onViewCurrent?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current File Section */}
          {currentFileUrl && !selectedFile && (
            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
              <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Current file
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-red-500" />
                  <div>
                    <p className="max-w-[200px] truncate text-sm font-medium">
                      {currentFileName || "File.pdf"}
                    </p>
                    <p className="text-xs text-gray-500">PDF Document</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewCurrent}>
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View File
                </Button>
              </div>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Selected file
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleClear}
                  disabled={isUploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-10 w-10 text-red-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* PDF Preview iframe */}
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-md border">
                  <iframe
                    src={previewUrl}
                    title="File Preview"
                    className="h-64 w-full"
                    style={{ border: "none" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* File Input */}
          <div className="space-y-2">
            <div
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                "hover:border-primary hover:bg-primary/5",
                error && "border-red-300 bg-red-50",
                selectedFile && "border-green-300 bg-green-50"
              )}
              onClick={() => !isUploading && inputRef.current?.click()}>
              <Upload
                className={cn(
                  "mx-auto mb-2 h-8 w-8",
                  error ? "text-red-400" : selectedFile ? "text-green-500" : "text-gray-400"
                )}
              />
              <p className="text-sm font-medium">
                {selectedFile ? "Click to select another file" : "Click to select a PDF file"}
              </p>
              <p className="mt-1 text-xs text-gray-500">Only PDF files accepted, max 10MB</p>
            </div>
            <Input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FileUploadModal;
