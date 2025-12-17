import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

interface ProfileDropdownProps {
  variant?: 'hero' | 'default';
}

export const ProfileDropdown = ({ variant = 'default' }: ProfileDropdownProps) => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <Link 
        to="/auth" 
        className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform overflow-hidden ${
          variant === 'hero' 
            ? 'bg-white/20 backdrop-blur-sm' 
            : 'bg-muted'
        }`}
      >
        <User className={`w-5 h-5 ${variant === 'hero' ? 'text-white' : 'text-foreground'}`} />
      </Link>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform overflow-hidden ${
            variant === 'hero' 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-muted'
          }`}
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`w-5 h-5 ${variant === 'hero' ? 'text-white' : 'text-foreground'}`} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background border border-border shadow-lg z-50"
      >
        <div className="px-3 py-2 border-b border-border">
          <p className="font-medium text-sm">{profile?.full_name || 'Utilisateur'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2 cursor-pointer">
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              <span>Mode clair</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Mode sombre</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
