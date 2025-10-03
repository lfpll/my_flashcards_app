/**
 * Image upload utilities
 * Converts image files to base64 data URLs for localStorage storage
 */

/**
 * @callback ProgressCallback
 * @param {number} progress - Progress percentage (0-100)
 */

/**
 * Convert an image file to base64 data URL
 * @param {File} file - Image file
 * @param {number} [maxWidth=800] - Maximum width for resizing
 * @param {ProgressCallback|null} [onProgress=null] - Optional progress callback
 * @returns {Promise<string>} Base64 data URL
 */
export function convertImageToBase64(file, maxWidth = 800, onProgress = null) {
  return new Promise((resolve, reject) => {
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
    
    reader.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        const progress = 10 + (e.loaded / e.total) * 40; // 10-50%
        onProgress(Math.round(progress));
      }
    };
    
    reader.onload = (e) => {
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
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate if string is a valid image URL or base64 data URL
 * @param {string} str - String to validate
 * @returns {boolean} True if valid
 */
export function isValidImageSource(str) {
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
 * @param {string} base64 - Base64 string
 * @returns {string} Size in KB or MB
 */
export function getBase64Size(base64) {
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
 * @param {ClipboardEvent} event - Clipboard event
 * @returns {File|null} Image file or null if no image found
 */
export function getImageFromClipboard(event) {
  const items = event.clipboardData?.items;
  if (!items) return null;

  // Look for image items in clipboard
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }

  return null;
}
