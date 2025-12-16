import { useState, useEffect } from 'react';
import { 
  Loader2, 
  Upload, 
  Download, 
  Share2, 
  Eye, 
  Trash2,
  UserMinus
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { auditApi } from '@/lib/api';
import { AuditLog, User, FileItem } from '@/types';
import { cn } from '@/lib/utils';

const getActionIcon = (action: string) => {
  switch (action) {
    case 'upload': return Upload;
    case 'download': return Download;
    case 'share': return Share2;
    case 'view': return Eye;
    case 'delete': return Trash2;
    case 'revoke': return UserMinus;
    default: return Eye;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'upload': return 'text-success bg-success/10';
    case 'download': return 'text-primary bg-primary/10';
    case 'share': return 'text-info bg-info/10';
    case 'delete': return 'text-destructive bg-destructive/10';
    case 'revoke': return 'text-warning bg-warning/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Activity = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const data = await auditApi.getMyLogs(token) as AuditLog[];
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      }
      setIsLoading(false);
    };

    fetchLogs();
  }, [token]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Activity</h1>
          <p className="text-muted-foreground mt-1">
            Your recent file activity
          </p>
        </div>

        {/* Activity List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Eye className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Your file activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const colorClass = getActionColor(log.action);
              const file = log.file as FileItem;
              const user = log.user as User;

              return (
                <div 
                  key={log._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClass)}>
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium capitalize">{log.action}</span>
                      {file && (
                        <>
                          {' '}
                          <span className="text-muted-foreground">—</span>
                          {' '}
                          <span className="font-medium">{file.originalName || 'Unknown file'}</span>
                        </>
                      )}
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Activity;
