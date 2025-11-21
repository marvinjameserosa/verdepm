import {
  StorageBucket,
  FileListResponse,
  ProjectDocument,
} from "@/types/storage";
import { supabase } from "@/lib/supabase/client";

export class StorageService {
  /**
   * List all files in a specific bucket
   */
  static async listFiles(
    bucket: StorageBucket,
    path?: string
  ): Promise<FileListResponse[]> {
    try {
      console.log(`Listing files in bucket: ${bucket}`);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout listing files in bucket: ${bucket}`)),
          10000
        )
      );

      const listPromise = supabase.storage.from(bucket).list(path || "", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

      const { data, error } = await Promise.race([listPromise, timeoutPromise]);

      if (error) {
        console.error(`Error listing files in ${bucket}:`, error);
        throw error;
      }

      console.log(`Found ${data?.length || 0} files in ${bucket}`);
      return data || [];
    } catch (error) {
      console.error(`Storage service error for bucket ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for downloading a file
   */
  static async getDownloadUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error("Error creating signed URL:", error);
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Storage service error:", error);
      throw error;
    }
  }

  /**
   * Download a file as blob
   */
  static async downloadFile(
    bucket: StorageBucket,
    path: string
  ): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        console.error("Error downloading file:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Storage service error:", error);
      throw error;
    }
  }

  /**
   * Upload a file to storage
   */
  static async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File,
    options?: { cacheControl?: string; contentType?: string; upsert?: boolean }
  ): Promise<{ path: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || "3600",
          contentType: options?.contentType || file.type,
          upsert: options?.upsert || false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw error;
      }

      return { path: data.path };
    } catch (error) {
      console.error("Storage service error:", error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(
    bucket: StorageBucket,
    paths: string[]
  ): Promise<void> {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);

      if (error) {
        console.error("Error deleting files:", error);
        throw error;
      }
    } catch (error) {
      console.error("Storage service error:", error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(
    bucket: StorageBucket,
    path: string
  ): Promise<FileListResponse | null> {
    try {
      const files = await this.listFiles(bucket);
      return files.find((file) => file.name === path) || null;
    } catch (error) {
      console.error("Storage service error:", error);
      throw error;
    }
  }

  /**
   * Get all files from both document buckets for a project
   */
  static async getProjectFiles(projectId?: string): Promise<{
    preconstructionDocs: FileListResponse[];
    constructionDocs: FileListResponse[];
    esgReports: FileListResponse[];
  }> {
    try {
      console.log("StorageService: Starting to fetch project files...");

      // Check authentication first
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("Authentication status:", {
        authenticated: !!user,
        email: user?.email,
        error: authError?.message,
      });

      const results = await Promise.allSettled([
        this.listFiles("preconstruction-docs"),
        this.listFiles("construction-docs"),
        this.listFiles("esg-reports"),
      ]);

      const preconstructionDocs =
        results[0].status === "fulfilled" ? results[0].value : [];
      const constructionDocs =
        results[1].status === "fulfilled" ? results[1].value : [];
      const esgReports =
        results[2].status === "fulfilled" ? results[2].value : [];

      // Log any failed bucket accesses with detailed error info
      if (results[0].status === "rejected") {
        console.warn("Failed to load preconstruction-docs:", results[0].reason);
      }
      if (results[1].status === "rejected") {
        console.warn("Failed to load construction-docs:", results[1].reason);
      }
      if (results[2].status === "rejected") {
        console.warn("Failed to load esg-reports:", results[2].reason);
      }

      // Special handling for empty results that might indicate RLS issues
      const totalFiles =
        preconstructionDocs.length +
        constructionDocs.length +
        esgReports.length;
      if (totalFiles === 0 && user) {
        console.warn(
          "🚨 RLS ISSUE DETECTED: User is authenticated but no files found in any bucket"
        );
        console.warn(
          "   This usually means Row Level Security policies are not configured properly"
        );
        console.warn(
          "   👉 Solution: Apply RLS policies in Supabase SQL Editor"
        );
        console.warn("   📁 Run the SQL from: fix-storage-policies.sql");
      }

      // Filter by project if projectId is provided (if files are organized by project folders)
      const filterByProject = (
        files: FileListResponse[],
        projectId?: string
      ) => {
        if (!projectId) return files;
        return files.filter((file) => file.name.includes(projectId));
      };

      const result = {
        preconstructionDocs: filterByProject(preconstructionDocs, projectId),
        constructionDocs: filterByProject(constructionDocs, projectId),
        esgReports: filterByProject(esgReports, projectId),
      };

      console.log("StorageService: Project files loaded successfully:", {
        preconstruction: result.preconstructionDocs.length,
        construction: result.constructionDocs.length,
        esgReports: result.esgReports.length,
      });

      return result;
    } catch (error) {
      console.error("StorageService: Error getting project files:", error);
      throw new Error(
        `Failed to load project files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Validate that all required buckets exist
   */
  static async validateBuckets(): Promise<{
    exists: string[];
    missing: string[];
  }> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error("Error listing buckets:", error);
        throw error;
      }

      const requiredBuckets: StorageBucket[] = [
        "preconstruction-docs",
        "construction-docs",
        "esg-reports",
      ];
      const existingBucketNames = buckets?.map((b: { name: string }) => b.name) || [];

      const exists = requiredBuckets.filter((bucket) =>
        existingBucketNames.includes(bucket)
      );
      const missing = requiredBuckets.filter(
        (bucket) => !existingBucketNames.includes(bucket)
      );

      console.log("Bucket validation:", {
        exists,
        missing,
        allBuckets: existingBucketNames,
      });

      return { exists, missing };
    } catch (error) {
      console.error("Error validating buckets:", error);
      throw error;
    }
  }

  /**
   * Helper to format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Helper to get file icon based on mime type
   */
  static getFileIcon(mimeType: string): string {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("text")) return "📝";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📽️";
    if (mimeType.includes("document") || mimeType.includes("word")) return "📄";
    if (mimeType.includes("zip") || mimeType.includes("archive")) return "🗜️";
    return "📁";
  }
}
