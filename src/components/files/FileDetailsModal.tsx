import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Download,
  Share2,
  Calendar,
  HardDrive,
  User,
  Users
} from 'lucide-react';
import { FileItem, User as UserType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FileDetailsModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  onDownload: (file: FileItem) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) return FileSpreadsheet;
  return File;
};

const getFileColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'text-pink-500 bg-pink-50';
  if (mimeType.includes('pdf')) return 'text-red-500 bg-red-50';
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) return 'text-green-500 bg-green-50';
  return 'text-primary bg-primary/10';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const FileDetailsModal = ({ file, isOpen, onClose, onShare, onDownload }: FileDetailsModalProps) => {
  if (!file) return null;

  const FileIcon = getFileIcon(file.mimeType);
  const colorClass = getFileColor(file.mimeType);
  const owner = file.owner as UserType;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Preview */}
          <div className={cn(
            'aspect-video rounded-xl flex items-center justify-center',
            colorClass.split(' ')[1]
          )}>
            <FileIcon className={cn('w-20 h-20', colorClass.split(' ')[0])} />
          </div>

          {/* File Name */}
          <div>
            <h3 className="font-semibold text-lg break-words">{file.originalName}</h3>
            <Badge variant="secondary" className="mt-2">
              {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
            </Badge>
          </div>

          <Separator />

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="text-sm font-medium">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Uploaded</p>
                <p className="text-sm font-medium">{formatDate(file.uploadDate)}</p>
              </div>
            </div>
          </div>

          {/* Owner */}
          {owner && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm font-medium">{owner.name || owner.email}</p>
                </div>
              </div>
            </>
          )}

          {/* Shared With */}
          {file.sharedWith.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Shared with {file.sharedWith.length} user(s)</p>
                </div>
                <div className="flex -space-x-2">
                  {file.sharedWith.slice(0, 5).map((share, index) => {
                    const user = share.user as UserType;
                    return (
                      <Avatar key={index} className="w-8 h-8 border-2 border-card">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {file.sharedWith.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                      +{file.sharedWith.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => onDownload(file)} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onShare} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
