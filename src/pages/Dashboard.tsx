import { useState, useEffect } from 'react';
import { Search, Grid, List, SlidersHorizontal, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileGrid } from '@/components/files/FileGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/lib/api';
import { FileItem } from '@/types';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const { token } = useAuth();

  const fetchFiles = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const data = await filesApi.getMyFiles(token) as FileItem[];
      setFiles(data);
      setFilteredFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  useEffect(() => {
    let result = [...files];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(file => 
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

    setFilteredFiles(result);
  }, [files, searchQuery, sortBy]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="text-muted-foreground mt-1">
            Manage and share your uploaded files
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <DropdownMenuRadioItem value="date">Date uploaded</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn('h-8 w-8', viewMode === 'grid' && 'bg-muted')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn('h-8 w-8', viewMode === 'list' && 'bg-muted')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* File Stats */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</span>
          <span>
            {(filteredFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <FileGrid 
            files={filteredFiles} 
            onRefresh={fetchFiles}
            emptyMessage="Upload your first file to get started"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
