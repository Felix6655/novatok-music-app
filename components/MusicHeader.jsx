'use client';

import Link from 'next/link';
import { Music2, User, LogIn, LogOut, Settings } from 'lucide-react';
import SearchBar from './SearchBar';
import TabsNav from './TabsNav';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/context/AuthContext';
import { isGuestMode } from '@/lib/env';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MusicHeader() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isSupabaseConfigured, signOut, loading } = useAuth();
  const guestMode = isGuestMode();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/music');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        {/* Top Row: Logo, Search, Auth */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Logo */}
          <Link href="/music" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">NovaTok Music</h1>
              <p className="text-xs text-white/60">Discover your sound</p>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Auth / User Menu */}
          <div className="flex items-center gap-2">
            {guestMode && (
              <span className="hidden md:inline-block px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                Guest Mode
              </span>
            )}
            
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-10 h-10 rounded-full p-0 hover:bg-white/10">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-purple-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1a1a2e] border-white/10">
                  <div className="px-2 py-2">
                    <p className="text-white font-medium truncate">{profile?.display_name || 'User'}</p>
                    <p className="text-white/60 text-sm truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link href="/music/account"><User className="w-4 h-4 mr-2" /> My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link href="/music/my-tracks"><Music2 className="w-4 h-4 mr-2" /> My Tracks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                    <Link href="/music/settings"><Settings className="w-4 h-4 mr-2" /> Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isSupabaseConfigured ? (
              <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/music/login"><LogIn className="w-4 h-4 mr-2" /> Sign In</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
                <Link href="/music/settings"><Settings className="w-5 h-5" /></Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <TabsNav />
      </div>
    </header>
  );
}
