/**
 * useFileDrop.ts
 * File drag-and-drop hook with visual feedback
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseFileDropOptions {
  accept?: string[];  // e.g., ['audio/*', '.mp3', '.wav']
  multiple?: boolean;
  onDrop: (files: File[]) => void;
  onError?: (message: string) => void;
}

interface UseFileDropReturn {
  isDragging: boolean;
  dragProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export const useFileDrop = (options: UseFileDropOptions): UseFileDropReturn => {
  const { accept = [], multiple = true, onDrop, onError } = options;
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const isAcceptedFile = useCallback((file: File): boolean => {
    if (accept.length === 0) return true;

    return accept.some(pattern => {
      if (pattern.startsWith('.')) {
        // Extension match
        return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      }
      if (pattern.includes('/*')) {
        // MIME type wildcard
        const [type] = pattern.split('/');
        return file.type.startsWith(type + '/');
      }
      // Exact MIME type
      return file.type === pattern;
    });
  }, [accept]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (droppedFiles.length === 0) {
      onError?.('No files dropped');
      return;
    }

    const validFiles = droppedFiles.filter(isAcceptedFile);
    
    if (validFiles.length === 0) {
      onError?.(`Invalid file type. Accepted: ${accept.join(', ')}`);
      return;
    }

    const filesToUse = multiple ? validFiles : [validFiles[0]];
    onDrop(filesToUse);
  }, [accept, multiple, onDrop, onError, isAcceptedFile]);

  return {
    isDragging,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};

// Global drop zone hook (for entire window)
export const useGlobalFileDrop = (options: UseFileDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const { accept = [], multiple = true, onDrop, onError } = options;

  const isAcceptedFile = useCallback((file: File): boolean => {
    if (accept.length === 0) return true;
    return accept.some(pattern => {
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      }
      if (pattern.includes('/*')) {
        const [type] = pattern.split('/');
        return file.type.startsWith(type + '/');
      }
      return file.type === pattern;
    });
  }, [accept]);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      dragCounter = 0;

      if (!e.dataTransfer?.files) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(isAcceptedFile);

      if (validFiles.length === 0) {
        onError?.(`Invalid file type. Accepted: ${accept.join(', ')}`);
        return;
      }

      const filesToUse = multiple ? validFiles : [validFiles[0]];
      onDrop(filesToUse);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [accept, multiple, onDrop, onError, isAcceptedFile]);

  return { isDragging };
};

export default useFileDrop;
