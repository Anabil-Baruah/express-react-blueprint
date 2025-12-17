import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FolderOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-hero p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <FolderOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">CloudVault</span>
        </div>
        <Card className="shadow-elevated border-0">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">404</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  The page you’re looking for doesn’t exist or was moved.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button className="gradient-primary" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Go to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
