"use client";

import { useCallback, useEffect, useState } from "react";
import {
    uploadOrganizationDocument,
    removeOrganizationDocument,
    getOrganizationDocuments,
} from "@/actions/organization/organizationDocuments";

export type DocumentType = "sec-dti" | "mayors-permit" | "bir";

interface DocumentInfo {
    storagePath: string | null;
    fileUrl: string | null;
    uploadedAt: string | null;
}

interface OrganizationDocuments {
    "sec-dti": DocumentInfo;
    "mayors-permit": DocumentInfo;
    "bir": DocumentInfo;
}

interface UseOrganizationDocumentsReturn {
    documents: OrganizationDocuments | null;
    isLoading: boolean;
    uploadError: string | null;
    isUploading: Record<DocumentType, boolean>;
    handleDocumentUpload: (documentType: DocumentType, file: File) => Promise<void>;
    handleDocumentRemove: (documentType: DocumentType) => Promise<void>;
    getDocumentByType: (documentType: DocumentType) => DocumentInfo | null;
    refreshDocuments: () => Promise<void>;
}

export const useOrganizationDocuments = (
    organizationId: string | null
): UseOrganizationDocumentsReturn => {
    const [documents, setDocuments] = useState<OrganizationDocuments | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<Record<DocumentType, boolean>>({
        "sec-dti": false,
        "mayors-permit": false,
        "bir": false,
    });

    const loadDocuments = useCallback(async () => {
        if (!organizationId) return;

        setIsLoading(true);
        try {
            const data = await getOrganizationDocuments(organizationId);

            // Transform the flat data into our structure
            setDocuments({
                "sec-dti": {
                    storagePath: data.sec_dti_storage_path,
                    fileUrl: data.sec_dti_file_url,
                    uploadedAt: data.sec_dti_uploaded_at,
                },
                "mayors-permit": {
                    storagePath: data.mayors_permit_storage_path,
                    fileUrl: data.mayors_permit_file_url,
                    uploadedAt: data.mayors_permit_uploaded_at,
                },
                "bir": {
                    storagePath: data.bir_storage_path,
                    fileUrl: data.bir_file_url,
                    uploadedAt: data.bir_uploaded_at,
                },
            });
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    const handleDocumentUpload = useCallback(
        async (documentType: DocumentType, file: File) => {
            if (!organizationId) return;

            setIsUploading((prev) => ({ ...prev, [documentType]: true }));
            setUploadError(null);

            // Get existing document path if any
            const previousPath = documents?.[documentType]?.storagePath || null;

            try {
                await uploadOrganizationDocument({
                    organizationId,
                    documentType,
                    file,
                    previousPath,
                });

                // Refresh documents list
                await loadDocuments();
                setUploadError(null);
            } catch (error) {
                console.error("Failed to upload document", error);
                setUploadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to upload document. Please try again."
                );
            } finally {
                setIsUploading((prev) => ({ ...prev, [documentType]: false }));
            }
        },
        [organizationId, documents, loadDocuments]
    );

    const handleDocumentRemove = useCallback(
        async (documentType: DocumentType) => {
            if (!organizationId) return;

            setIsUploading((prev) => ({ ...prev, [documentType]: true }));
            setUploadError(null);

            try {
                await removeOrganizationDocument(organizationId, documentType);

                // Refresh documents list
                await loadDocuments();
                setUploadError(null);
            } catch (error) {
                console.error("Failed to remove document", error);
                setUploadError(
                    error instanceof Error
                        ? error.message
                        : "Unable to remove document. Please try again."
                );
            } finally {
                setIsUploading((prev) => ({ ...prev, [documentType]: false }));
            }
        },
        [organizationId, loadDocuments]
    );

    const getDocumentByType = useCallback(
        (documentType: DocumentType): DocumentInfo | null => {
            return documents?.[documentType] || null;
        },
        [documents]
    );

    return {
        documents,
        isLoading,
        uploadError,
        isUploading,
        handleDocumentUpload,
        handleDocumentRemove,
        getDocumentByType,
        refreshDocuments: loadDocuments,
    };
};
