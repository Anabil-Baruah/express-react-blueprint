import { useState, useEffect } from 'react';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Trash2,
  Search,
  UserPlus
} from 'lucide-react';
import { FileItem, User } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi, usersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ShareModal = ({ file, isOpen, onClose, onUpdate }: ShareModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [permission, setPermission] = useState<'view' | 'download'>('view');
  const [linkExpiry, setLinkExpiry] = useState<string>('never');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!searchQuery || !token) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const results = await usersApi.search(searchQuery, token) as User[];
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, token]);

  const handleAddUser = (user: User) => {
    if (!selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleShareWithUsers = async () => {
    if (!file || !token || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      await filesApi.shareWithUsers(
        file._id, 
        { users: selectedUsers.map(u => u._id), permission }, 
        token
      );
      toast({
        title: 'Shared successfully',
        description: `File shared with ${selectedUsers.length} user(s)`,
      });
      setSelectedUsers([]);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share file',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleGenerateLink = async () => {
    if (!file || !token) return;

    setIsLoading(true);
    try {
      const expiresIn = linkExpiry === 'never' ? undefined : 
        linkExpiry === '1h' ? 3600 :
        linkExpiry === '24h' ? 86400 :
        linkExpiry === '7d' ? 604800 : undefined;

      const result = await filesApi.generateShareLink(file._id, { expiresIn }, token) as { link: string };
      setGeneratedLink(result.link);
      toast({
        title: 'Link generated',
        description: 'Share link has been created',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate link',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyActiveLink = async (linkToken: string, linkId: string) => {
    const fullLink = `${window.location.origin}/shared/${linkToken}`;
    await navigator.clipboard.writeText(fullLink);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleRevokeLink = async (linkId: string) => {
    if (!file || !token) return;

    try {
      await filesApi.revokeShareLink(file._id, linkId, token);
      toast({
        title: 'Link revoked',
        description: 'Share link has been disabled',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke link',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeUserAccess = async (userId: string) => {
    if (!file || !token) return;

    try {
      await filesApi.revokeUserAccess(file._id, userId, token);
      toast({
        title: 'Access revoked',
        description: 'User access has been removed',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke access',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share "{file.originalName}"
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="users" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Share with Users
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="w-4 h-4" />
              Share via Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            {/* User Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-elevated z-10 max-h-48 overflow-auto">
                  {searchResults.map(user => (
                    <button
                      key={user._id}
                      onClick={() => handleAddUser(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <Badge key={user._id} variant="secondary" className="gap-1 py-1 pl-1 pr-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                    <button onClick={() => handleRemoveUser(user._id)}>
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Permission Select */}
            <Select value={permission} onValueChange={(v) => setPermission(v as 'view' | 'download')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Can view</SelectItem>
                <SelectItem value="download">Can download</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleShareWithUsers} 
              disabled={selectedUsers.length === 0 || isLoading}
              className="w-full gradient-primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Share with {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
            </Button>

            {/* Currently Shared With */}
            {file.sharedWith.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Currently shared with</h4>
                <div className="space-y-2">
                  {file.sharedWith.map((share, index) => {
                    const user = share.user as User;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(user.name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{share.permission}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeUserAccess(user._id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            {/* Link Expiry */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Link expires
              </label>
              <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateLink} 
              disabled={isLoading}
              className="w-full gradient-primary"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Generate Link
            </Button>

            {/* Generated Link */}
            {generatedLink && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-success mb-2">Link generated!</p>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="text-xs bg-card"
                  />
                  <Button onClick={handleCopyLink} variant="outline" size="icon">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Only authenticated users can access this link
                </p>
              </div>
            )}

            {/* Active Share Links */}
            {file.shareLinks.filter(l => l.isActive).length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Active share links</h4>
                <div className="space-y-2">
                  {file.shareLinks.filter(l => l.isActive).map(link => (
                    <div key={link._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono truncate">{link.token.slice(0, 20)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {link.expiresAt 
                            ? `Expires: ${new Date(link.expiresAt).toLocaleDateString()}` 
                            : 'No expiration'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyActiveLink(link.token, link._id)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {copiedLinkId === link._id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeLink(link._id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
