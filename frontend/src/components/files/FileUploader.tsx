import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUploader = ({ onUploadComplete }: { onUploadComplete?: () => void }) => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(file => {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { file, progress: 0, status: 'error' as const, error: 'File type not allowed' };
      }
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return { file, progress: 0, status: 'error' as const, error: 'File size exceeds 50MB' };
      }
      return { file, progress: 0, status: 'pending' as const };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!token) return;
    
    setIsUploading(true);
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const uploadingFile = pendingFiles[i];
      const fileIndex = files.findIndex(f => f.file === uploadingFile.file);
      
      setFiles(prev => prev.map((f, idx) => 
        idx === fileIndex ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      try {
        const formData = new FormData();
        formData.append('files', uploadingFile.file);

        // Simulate progress (since XMLHttpRequest would be needed for real progress)
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map((f, idx) => 
            idx === fileIndex && f.progress < 90 
              ? { ...f, progress: f.progress + 10 } 
              : f
          ));
        }, 200);

        await filesApi.upload(formData, token);
        
        clearInterval(progressInterval);
        
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'success' as const, progress: 100 } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex ? { ...f, status: 'error' as const, error: 'Upload failed' } : f
        ));
      }
    }

    setIsUploading(false);
    toast({
      title: 'Upload Complete',
      description: `Successfully uploaded ${pendingFiles.filter(f => 
        files.find(file => file.file === f.file)?.status === 'success'
      ).length} files`,
    });
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300',
          'hover:border-primary hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/10 scale-[1.02]',
          !isDragActive && 'border-border'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
            isDragActive ? 'gradient-primary shadow-glow' : 'bg-muted'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-all duration-300',
              isDragActive ? 'text-primary-foreground scale-110' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse from your computer
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports: PDF, Images, CSV, Excel • Max 50MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Files ({files.length})</h3>
            {pendingCount > 0 && (
              <Button 
                onClick={uploadFiles} 
                disabled={isUploading}
                className="gradient-primary"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((uploadFile, index) => (
              <div 
                key={index}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                  uploadFile.status === 'error' && 'border-destructive/50 bg-destructive/5',
                  uploadFile.status === 'success' && 'border-success/50 bg-success/5',
                  (uploadFile.status === 'pending' || uploadFile.status === 'uploading') && 'border-border bg-card'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  uploadFile.status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
                )}>
                  <FileText className={cn(
                    'w-5 h-5',
                    uploadFile.status === 'error' ? 'text-destructive' : 'text-primary'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadFile.file.size)}
                    {uploadFile.error && (
                      <span className="text-destructive ml-2">• {uploadFile.error}</span>
                    )}
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-1 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
