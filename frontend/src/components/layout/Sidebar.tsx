import { Link, useLocation } from 'react-router-dom';
import { 
  FolderOpen, 
  Share2, 
  Clock, 
  Settings, 
  LogOut,
  Upload,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link to={to}>
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        'hover:bg-primary/10 hover:text-primary',
        isActive && 'bg-primary/10 text-primary font-medium'
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <FolderOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">CloudVault</span>
        </Link>
      </div>

      {/* Upload Button */}
      <div className="p-4">
        <Link to="/upload">
          <Button className="w-full gradient-primary shadow-soft hover:shadow-glow transition-all duration-300">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <NavItem
          to="/dashboard"
          icon={<Home className="w-5 h-5" />}
          label="My Files"
          isActive={location.pathname === '/dashboard'}
        />
        <NavItem
          to="/shared"
          icon={<Share2 className="w-5 h-5" />}
          label="Shared with me"
          isActive={location.pathname === '/shared'}
        />
        <NavItem
          to="/activity"
          icon={<Clock className="w-5 h-5" />}
          label="Activity"
          isActive={location.pathname === '/activity'}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          isActive={location.pathname === '/settings'}
        />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
