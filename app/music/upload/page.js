'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { isGuestMode } from '@/lib/env';
import { uploadTrack } from '@/lib/data/data-service';
import { 
  ArrowLeft, Upload, Music2, Image, Loader2, 
  CheckCircle2, AlertCircle, CloudOff 
} from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const guestMode = isGuestMode();

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-m4a'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav)$/i)) {
        toast.error('Invalid file type', { description: 'Please upload an MP3, M4A, or WAV file' });
        return;
      }
      setAudioFile(file);
      
      // Auto-fill title from filename if empty
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', { description: 'Please upload a JPEG, PNG, or WebP image' });
        return;
      }
      setCoverFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile || !title || !artist) {
      toast.error('Missing required fields', { description: 'Please fill in all required fields' });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const track = await uploadTrack({ title, artist, audioFile, coverFile });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      
      toast.success('Track uploaded!', { description: 'Your track is now available' });
      
      // Redirect to track page after brief delay
      setTimeout(() => {
        router.push(`/music/track/${track.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Upload failed', { description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  // Show guest mode restriction
  if (guestMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          asChild
          className="text-white/60 hover:text-white mb-6"
        >
          <Link href="/music">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Music
          </Link>
        </Button>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <CloudOff className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="text-white text-2xl">Upload Requires Supabase</CardTitle>
            <CardDescription className="text-white/60">
              Connect to Supabase to enable track uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/60 mb-6">
              Upload functionality requires cloud storage. Configure Supabase in your 
              environment variables to enable uploads.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/music/settings">View Settings</Link>
              </Button>
              <Button asChild className="bg-purple-500 hover:bg-purple-600">
                <Link href="/music">Browse Music</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        asChild
        className="text-white/60 hover:text-white mb-6"
      >
        <Link href="/music">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Music
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-white mb-2">Upload Track</h1>
      <p className="text-white/60 mb-8">Share your music with the world</p>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">Track Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio File */}
            <div>
              <Label htmlFor="audio" className="text-white/80">Audio File *</Label>
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp3,audio/wav"
                onChange={handleAudioSelect}
                className="hidden"
              />
              <div 
                onClick={() => audioInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  audioFile 
                    ? 'border-purple-500/50 bg-purple-500/10' 
                    : 'border-white/20 hover:border-purple-500/30 hover:bg-white/5'
                }`}
              >
                {audioFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <Music2 className="w-8 h-8 text-purple-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">{audioFile.name}</p>
                      <p className="text-white/60 text-sm">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60">Click to upload audio file</p>
                    <p className="text-white/40 text-sm">MP3, M4A, or WAV</p>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-white/80">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Track title"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>

            {/* Artist */}
            <div>
              <Label htmlFor="artist" className="text-white/80">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>

            {/* Cover Image */}
            <div>
              <Label htmlFor="cover" className="text-white/80">Cover Image (optional)</Label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverSelect}
                className="hidden"
              />
              <div 
                onClick={() => coverInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  coverFile 
                    ? 'border-purple-500/50 bg-purple-500/10' 
                    : 'border-white/20 hover:border-purple-500/30 hover:bg-white/5'
                }`}
              >
                {coverPreview ? (
                  <div className="flex items-center justify-center gap-4">
                    <img src={coverPreview} alt="Cover preview" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="text-left">
                      <p className="text-white font-medium">{coverFile.name}</p>
                      <p className="text-white/60 text-sm">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <Image className="w-8 h-8 text-white/40" />
                    <div className="text-left">
                      <p className="text-white/60">Add cover image</p>
                      <p className="text-white/40 text-sm">JPEG, PNG, or WebP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 mb-3">
                {uploadStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                )}
                <span className="text-white">
                  {uploadStatus === 'success' ? 'Upload complete!' : 
                   uploadStatus === 'error' ? 'Upload failed' : 'Uploading...'}
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading || !audioFile || !title || !artist}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload Track
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
