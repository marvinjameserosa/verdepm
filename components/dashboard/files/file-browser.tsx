"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Search, 
  Upload, 
  Folder,
  Calendar,
  FileArchive,
  Image,
  Video,
  Music,
  File
} from "lucide-react";
import { StorageService } from "@/lib/storage";
import { FileListResponse, StorageBucket } from "@/types/storage";

interface FileBrowserProps {
  projectId?: string;
  className?: string;
}

export default function FileBrowser({ projectId, className = "" }: FileBrowserProps) {
  const [files, setFiles] = useState<{
    preconstruction: FileListResponse[];
    construction: FileListResponse[];
    esgReports: FileListResponse[];
  }>({
    preconstruction: [],
    construction: [],
    esgReports: []
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket>("preconstruction-docs");

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const projectFiles = await StorageService.getProjectFiles(projectId);
      setFiles({
        preconstruction: projectFiles.preconstructionDocs,
        construction: projectFiles.constructionDocs,
        esgReports: projectFiles.esgReports
      });
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (bucket: StorageBucket, fileName: string) => {
    try {
      const url = await StorageService.getDownloadUrl(bucket, fileName);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please check if you have permission to access this file.');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'mp4': case 'avi': case 'mov': case 'wmv':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'mp3': case 'wav': case 'flac':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'zip': case 'rar': case '7z':
        return <FileArchive className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileSize = (file: FileListResponse): string => {
    if (file.metadata?.size) {
      return StorageService.formatFileSize(file.metadata.size);
    }
    return 'Unknown size';
  };

  const filterFiles = (fileList: FileListResponse[]) => {
    if (!searchTerm) return fileList;
    return fileList.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const FilesList = ({ fileList, bucket }: { fileList: FileListResponse[], bucket: StorageBucket }) => (
    <div className="space-y-3">
      {filterFiles(fileList).map((file, index) => (
        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(file.name)}
              <div className="flex-1">
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-4">
                  <span>{getFileSize(file)}</span>
                  {file.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownload(bucket, file.name)}
              className="ml-2"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </Card>
      ))}
      {filterFiles(fileList).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No files match your search' : 'No files found in this bucket'}
        </div>
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Project Files
            </CardTitle>
            <CardDescription>
              Browse and manage project documents and files
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="preconstruction" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preconstruction" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Preconstruction
              <Badge variant="secondary" className="ml-1">
                {files.preconstruction.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="construction" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Construction
              <Badge variant="secondary" className="ml-1">
                {files.construction.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="esg" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              ESG Reports
              <Badge variant="secondary" className="ml-1">
                {files.esgReports.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preconstruction" className="mt-4">
            <div className="mb-4">
              <h3 className="font-semibold text-emerald-700 mb-2">Preconstruction Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Project planning, permits, designs, and initial documentation
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <FilesList fileList={files.preconstruction} bucket="preconstruction-docs" />
            )}
          </TabsContent>

          <TabsContent value="construction" className="mt-4">
            <div className="mb-4">
              <h3 className="font-semibold text-blue-700 mb-2">Construction Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Construction logs, progress reports, and field documentation
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <FilesList fileList={files.construction} bucket="construction-docs" />
            )}
          </TabsContent>

          <TabsContent value="esg" className="mt-4">
            <div className="mb-4">
              <h3 className="font-semibold text-purple-700 mb-2">ESG Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Environmental, Social, and Governance reports and assessments
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <FilesList fileList={files.esgReports} bucket="esg-reports" />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
