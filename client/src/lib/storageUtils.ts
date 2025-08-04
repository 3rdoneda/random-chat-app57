import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import { storage } from "../firebaseConfig";

// Storage path constants
export const STORAGE_PATHS = {
  PROFILE_IMAGES: "profile-images",
  CHAT_PHOTOS: "chat-photos",
  AVATARS: "avatars",
  TEMP_PHOTOS: "temp-photos", // For photos that auto-delete
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PROFILE_IMAGE: 5 * 1024 * 1024, // 5MB
  CHAT_PHOTO: 10 * 1024 * 1024, // 10MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/**
 * Validate file before upload
 */
export function validateImageFile(
  file: File,
  maxSize: number = FILE_SIZE_LIMITS.CHAT_PHOTO,
): { isValid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size too large. Maximum size allowed: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Generate unique filename with timestamp
 */
export function generateFileName(
  originalName: string,
  prefix?: string,
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = prefix ? `${prefix}_` : "";
  return `${baseName}${timestamp}_${random}.${extension}`;
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; path: string }> {
  if (!file || !userId) {
    throw new Error('File and userId are required');
  }
  
  // Validate file
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.PROFILE_IMAGE);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileName = generateFileName(file.name, `profile_${userId}`);
  const filePath = `${STORAGE_PATHS.PROFILE_IMAGES}/${userId}/${fileName}`;
  const storageRef = ref(storage, filePath);

  try {
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Upload timeout after 60 seconds'));
        }, 60000);
        
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            clearTimeout(timeout);
            reject(new Error(getStorageErrorMessage(error)));
          },
          async () => {
            try {
              clearTimeout(timeout);
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, path: filePath });
            } catch (error) {
              clearTimeout(timeout);
              reject(new Error(getStorageErrorMessage(error)));
            }
          },
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, path: filePath };
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw new Error(getStorageErrorMessage(error));
  }
}

/**
 * Upload chat photo
 */
export async function uploadChatPhoto(
  file: File,
  chatId: string,
  userId: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; path: string }> {
  // Validate file
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.CHAT_PHOTO);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileName = generateFileName(file.name, `chat_${chatId}`);
  const filePath = `${STORAGE_PATHS.CHAT_PHOTOS}/${chatId}/${userId}/${fileName}`;
  const storageRef = ref(storage, filePath);

  try {
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, path: filePath });
            } catch (error) {
              reject(error);
            }
          },
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url, path: filePath };
    }
  } catch (error) {
    console.error("Error uploading chat photo:", error);
    throw new Error("Failed to upload chat photo");
  }
}

/**
 * Upload temporary photo (auto-deletes after chat)
 */
export async function uploadTempPhoto(
  file: File,
  sessionId: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; path: string; expiresAt: Date }> {
  // Validate file
  const validation = validateImageFile(file, FILE_SIZE_LIMITS.CHAT_PHOTO);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileName = generateFileName(file.name, `temp_${sessionId}`);
  const filePath = `${STORAGE_PATHS.TEMP_PHOTOS}/${sessionId}/${fileName}`;
  const storageRef = ref(storage, filePath);

  // Set metadata with expiration (24 hours from now)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const metadata = {
    customMetadata: {
      expiresAt: expiresAt.toISOString(),
      sessionId: sessionId,
      autoDelete: "true",
    },
  };

  try {
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, path: filePath, expiresAt });
            } catch (error) {
              reject(error);
            }
          },
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);
      return { url, path: filePath, expiresAt };
    }
  } catch (error) {
    console.error("Error uploading temp photo:", error);
    throw new Error("Failed to upload temporary photo");
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Delete all files in a directory (e.g., when chat session ends)
 */
export async function deleteChatPhotos(chatId: string): Promise<void> {
  try {
    const chatPhotosPath = `${STORAGE_PATHS.CHAT_PHOTOS}/${chatId}`;
    const chatRef = ref(storage, chatPhotosPath);

    // Note: Firebase Storage doesn't have a direct way to delete folders
    // You would need to list all files and delete them individually
    // For now, we'll just log this action - implement listing if needed
    console.log(`Request to delete chat photos for chat: ${chatId}`);

    // In a production app, you might want to:
    // 1. List all files in the chat directory
    // 2. Delete each file individually
    // 3. Or use Firebase Functions to handle batch deletions
  } catch (error) {
    console.error("Error deleting chat photos:", error);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath: string) {
  try {
    const fileRef = ref(storage, filePath);
    const metadata = await getMetadata(fileRef);
    return metadata;
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw new Error("Failed to get file metadata");
  }
}

/**
 * Convert File to base64 (for preview purposes)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload (optional utility)
 */
export function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        file.type,
        quality,
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Utility to handle common upload errors
 */
export function getStorageErrorMessage(error: any): string {
  const errorCode = error?.code;

  switch (errorCode) {
    case "storage/unauthorized":
      return "You do not have permission to upload files";
    case "storage/canceled":
      return "Upload was cancelled";
    case "storage/quota-exceeded":
      return "Storage quota exceeded";
    case "storage/unauthenticated":
      return "Please log in to upload files";
    case "storage/retry-limit-exceeded":
      return "Upload failed after multiple retries. Please try again";
    case "storage/invalid-format":
      return "Invalid file format";
    case "storage/invalid-event-name":
      return "Invalid upload event";
    default:
      return error?.message || "An unknown error occurred during upload";
  }
}
