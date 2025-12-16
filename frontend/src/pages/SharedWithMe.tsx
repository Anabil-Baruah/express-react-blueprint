import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileGrid } from '@/components/files/FileGrid';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/lib/api';
import { FileItem } from '@/types';

const SharedWithMe = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchFiles = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const data = await filesApi.getSharedWithMe(token) as FileItem[];
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch shared files:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Shared with me</h1>
          <p className="text-muted-foreground mt-1">
            Files that others have shared with you
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <FileGrid 
            files={files} 
            onRefresh={fetchFiles}
            emptyMessage="No files have been shared with you yet"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SharedWithMe;
