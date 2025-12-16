import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUploader } from '@/components/files/FileUploader';
import { Button } from '@/components/ui/button';

const Upload = () => {
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    // Optionally navigate back to dashboard after upload
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Files</h1>
            <p className="text-muted-foreground mt-1">
              Drag and drop or browse to upload
            </p>
          </div>
        </div>

        {/* Uploader */}
        <FileUploader onUploadComplete={handleUploadComplete} />
      </div>
    </DashboardLayout>
  );
};

export default Upload;
