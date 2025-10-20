export type ProgressCallback = (progress: number) => void;


export function convertImageToBase64(
  file: File,
  maxWidth: number = 800,
  onProgress: ProgressCallback | null = null
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Check file size - 2MB limit for better performance
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      reject(new Error('Image is too large. Please use an image smaller than 2MB.'));
      return;
    }

    // Report initial progress
    if (onProgress) onProgress(10);

    const reader = new FileReader();

    reader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (onProgress && e.lengthComputable) {
        const progress = 10 + (e.loaded / e.total) * 40; // 10-50%
        onProgress(Math.round(progress));
      }
    };

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (onProgress) onProgress(60);

      const img = new Image();

      img.onload = () => {
        if (onProgress) onProgress(70);

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if image is too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        if (onProgress) onProgress(80);

        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        if (onProgress) onProgress(90);

        // Convert to base64 with compression (quality 0.85 = good balance)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        if (onProgress) onProgress(100);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      const result = e.target?.result;
      if (typeof result === 'string') {
        img.src = result;
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate if string is a valid image URL or base64 data URL
 * @param str - String to validate
 * @returns True if valid
 */
export function isValidImageSource(str: string): boolean {
  if (!str) return false;

  // Check if it's a base64 data URL
  if (str.startsWith('data:image/')) {
    return true;
  }

  // Check if it's a valid URL
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable size from base64 string
 * @param base64 - Base64 string
 * @returns Size in KB or MB
 */
export function getBase64Size(base64: string): string {
  if (!base64) return '0 KB';

  const bytes = (base64.length * 3) / 4;
  const kb = bytes / 1024;

  if (kb > 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  return `${kb.toFixed(2)} KB`;
}

/**
 * Extract image from clipboard paste event
 * @param event - Clipboard event
 * @returns Image file or null if no image found
 */
export function getImageFromClipboard(event: React.ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  // Look for image items in clipboard
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }

  return null;
}
