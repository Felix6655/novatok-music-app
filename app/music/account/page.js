'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/context/AuthContext';
import { ArrowLeft, Loader2, User, Mail, LogOut, Music2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isSupabaseConfigured, signOut, updateProfile, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!isSupabaseConfigured || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Button variant="ghost" asChild className="text-white/60 hover:text-white mb-6">
          <Link href="/music"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
        </Button>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Not Signed In</CardTitle>
            <CardDescription className="text-white/60">
              Sign in to manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-purple-500 hover:bg-purple-600">
              <Link href="/music/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({ display_name: displayName, bio });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/music');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Button variant="ghost" asChild className="text-white/60 hover:text-white mb-6">
        <Link href="/music"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Music</Link>
      </Button>

      <h1 className="text-3xl font-bold text-white mb-8">My Account</h1>

      {/* Profile Card */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{profile?.display_name || 'User'}</p>
                <p className="text-white/60 text-sm">{user?.email}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="displayName" className="text-white/80">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-white/80">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="bg-purple-500 hover:bg-purple-600">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Your Music</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/music/my-tracks">
              <Music2 className="w-4 h-4 mr-2" /> My Uploaded Tracks
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
            <Link href="/music/playlists">
              <Music2 className="w-4 h-4 mr-2" /> My Playlists
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <Button onClick={handleSignOut} variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
