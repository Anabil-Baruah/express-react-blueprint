import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Lock, 
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/lib/api';
import { FileItem } from '@/types';
import { cn } from '@/lib/utils';

const SharedLink = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [file, setFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!shareToken || !token) return;
      
      setIsLoading(true);
      try {
        const data = await filesApi.accessByLink(token, shareToken) as FileItem;
        setFile(data);
        setPreviewUrl(data.path || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to access file');
      }
      setIsLoading(false);
    };

    if (isAuthenticated && !authLoading) {
      fetchFile();
    }
  }, [shareToken, token, isAuthenticated, authLoading]);

  const handleDownload = () => {
    if (!file || !token) return;
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
      .catch(() => {});
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated border-0">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                <p className="text-muted-foreground">
                  You need to be logged in to access this shared file.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button className="gradient-primary" onClick={() => navigate('/register')}>
                  Create account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !file) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated border-0">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  {error || 'This link may have expired or you do not have permission to access this file.'}
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success - show file
  return (
    <div className="min-h-screen gradient-hero p-4">
      <div className="max-w-4xl mx-auto animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <FolderOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">CloudVault</span>
        </div>

        <Card className="shadow-elevated border-0 mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold break-words">{file.originalName}</h2>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase()}
              </p>
            </div>
          </CardContent>
        </Card>

        {previewUrl ? (
          <>
            {file.mimeType.startsWith('image/') && (
              <div className="border border-border rounded-lg overflow-hidden bg-card flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={file.originalName}
                  className="max-h-[80vh] w-auto"
                />
              </div>
            )}
            {file.mimeType.includes('pdf') && (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <object
                  data={previewUrl}
                  type={file.mimeType}
                  className="w-full h-[80vh]"
                >
                  <iframe
                    src={previewUrl}
                    className="w-full h-[80vh]"
                    title={file.originalName}
                  />
                </object>
              </div>
            )}
            {!file.mimeType.startsWith('image/') && !file.mimeType.includes('pdf') && (
              <div className="border border-border rounded-lg overflow-hidden bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Preview is not available for this file type.
                </p>
              </div>
            )}
          </>
        ) : (
          <Card className="shadow-elevated border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Preview will appear here when available.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Button 
            onClick={handleDownload}
            className="w-full gradient-primary"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedLink;
