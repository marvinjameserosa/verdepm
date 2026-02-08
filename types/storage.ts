// Storage and file management types

export interface StorageFile {
  id: string;
  name: string;
  bucket_id: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  metadata?: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl?: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export interface FileUpload {
  file: File;
  path: string;
  bucket: string;
  metadata?: Record<string, any>;
}

export interface BucketInfo {
  id: string;
  name: string;
  owner?: string;
  created_at: string;
  updated_at: string;
  public: boolean;
  avif_autodetection?: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
}

export type FileDownloadResponse =
  | {
      data: Blob;
      error: null;
    }
  | {
      data: null;
      error: Error;
    };

export interface FileListResponse {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

export type StorageBucket =
  | "preconstruction-docs"
  | "construction-docs"
  | "esg-reports"
  | "esg-files"
  | "receipts";

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  fileName: string;
  filePath: string;
  bucket: StorageBucket;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy?: string;
  category?:
    | "preconstruction"
    | "construction"
    | "esg"
    | "compliance"
    | "other";
  tags?: string[];
  description?: string;
}
