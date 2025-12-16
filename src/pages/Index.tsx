import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Upload, 
  Share2, 
  Shield, 
  Users,
  Link2,
  Clock,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Upload,
    title: 'Easy Upload',
    description: 'Drag and drop files or browse. Support for bulk uploads up to 50MB per file.',
  },
  {
    icon: Share2,
    title: 'Share with Users',
    description: 'Share files with specific users. Control who can view or download.',
  },
  {
    icon: Link2,
    title: 'Share via Link',
    description: 'Generate secure shareable links. Only authenticated users can access.',
  },
  {
    icon: Clock,
    title: 'Link Expiry',
    description: 'Set expiration times for shared links. Auto-revoke access after expiry.',
  },
  {
    icon: Shield,
    title: 'Access Control',
    description: 'Robust security. Files protected with proper authorization checks.',
  },
  {
    icon: Users,
    title: 'Audit Logs',
    description: 'Track file activity. See who shared, viewed, or downloaded your files.',
  },
];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <FolderOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CloudVault</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="gradient-primary">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-primary">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMCwxNTMsMjA0LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Secure File Sharing Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Store, Share & Manage
              <span className="block gradient-primary bg-clip-text text-transparent">
                Your Files Securely
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern file sharing solution like Google Drive. Upload files, share with specific users or via links, with complete access control.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" className="gradient-primary shadow-glow hover:shadow-elevated transition-all duration-300 h-12 px-8">
                  {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage files
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features to upload, share, and control access to your files with enterprise-grade security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="pt-8 pb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple & Secure
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Create Account', description: 'Sign up with your email and password' },
                { step: '2', title: 'Upload Files', description: 'Drag & drop or browse to upload files' },
                { step: '3', title: 'Share Securely', description: 'Share with users or generate secure links' },
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground shadow-soft">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto gradient-primary border-0 shadow-glow overflow-hidden">
            <CardContent className="p-12 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join CloudVault today and experience secure file sharing with complete control over your data.
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-primary font-semibold">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">CloudVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CloudVault. Secure file sharing solution.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
