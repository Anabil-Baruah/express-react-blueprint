import { useState } from 'react';
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File, 
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye
} from 'lucide-react';
import { FileItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: FileItem;
  onShare: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDetails: (file: FileItem) => void;
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
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const FileCard = ({ file, onShare, onDelete, onDownload, onView, onDetails }: FileCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const FileIcon = getFileIcon(file.mimeType);
  const colorClass = getFileColor(file.mimeType);

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:shadow-elevated hover:-translate-y-1',
        'border border-border/50 bg-card'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(file)}
    >
      {/* File Preview Area */}
      <div className={cn(
        'aspect-square flex items-center justify-center transition-all duration-300',
        colorClass.split(' ')[1]
      )}>
        <FileIcon className={cn('w-16 h-16 transition-transform duration-300', colorClass.split(' ')[0], isHovered && 'scale-110')} />
      </div>

      {/* File Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm truncate" title={file.originalName}>
          {file.originalName}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.uploadDate)}</span>
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <div className={cn(
        'absolute top-2 right-2 transition-opacity duration-200',
        isHovered ? 'opacity-100' : 'opacity-0'
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDetails(file); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(file); }}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(file); }}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(file); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Shared Indicator */}
      {(file.sharedWith.length > 0 || file.shareLinks.length > 0) && (
        <div className="absolute bottom-16 left-4">
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
            <Share2 className="w-3 h-3" />
            Shared
          </div>
        </div>
      )}
    </Card>
  );
};
