import UploadContent from './UploadContent';

export const metadata = {
  title: 'Upload Track – Share Your Music',
  description: 'Upload your music to NovaTok Music and share it with listeners worldwide. Support for MP3, WAV, and M4A formats.',
  keywords: ['upload music', 'share tracks', 'music upload', 'publish music', 'share songs'],
  openGraph: {
    title: 'Upload Track – Share Your Music | NovaTok Music',
    description: 'Upload your music to NovaTok Music and share it with listeners worldwide.',
  },
};

export default function UploadPage() {
  return <UploadContent />;
}
