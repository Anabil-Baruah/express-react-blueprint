import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileItem } from '@/types';
import { FileCard } from './FileCard';
import { ShareModal } from './ShareModal';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FileGridProps {
  files: FileItem[];
  onRefresh: () => void;
  emptyMessage?: string;
}

export const FileGrid = ({ files, onRefresh, emptyMessage = 'No files found' }: FileGridProps) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleShare = (file: FileItem) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  const handleView = (file: FileItem) => {
    navigate(`/file/${file._id}`);
  };

  const handleDownload = (file: FileItem) => {
    if (!token) return;
    filesApi.downloadBlob(file._id, token)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to download file',
          variant: 'destructive',
        });
      });
  };

  const handleDeleteClick = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete || !token) return;

    try {
      await filesApi.deleteFile(fileToDelete._id, token);
      toast({
        title: 'File deleted',
        description: 'The file has been permanently deleted',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }

    setFileToDelete(null);
    setDeleteDialogOpen(false);
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No files yet</h3>
        <p className="text-muted-foreground max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => (
          <FileCard
            key={file._id}
            file={file}
            onShare={handleShare}
            onDelete={handleDeleteClick}
            onDownload={handleDownload}
            onView={handleView}
          />
        ))}
      </div>

      <ShareModal
        file={selectedFile}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onUpdate={onRefresh}
      />

      {/* Mini preview modal removed in favor of full preview page */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.originalName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
