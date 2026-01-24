'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, TrendingUp, Heart, Clock, Wand2, FileText, Mic 
} from 'lucide-react';

const tabs = [
  { id: 'discover', label: 'Discover', icon: Sparkles, href: '/music', param: null },
  { id: 'trending', label: 'Trending', icon: TrendingUp, href: '/music', param: 'trending' },
  { id: 'liked', label: 'Liked', icon: Heart, href: '/music', param: 'liked' },
  { id: 'recent', label: 'Recent', icon: Clock, href: '/music', param: 'recent' },
  { id: 'ai-studio', label: 'AI Studio', icon: Wand2, href: '/music/ai-studio', param: null },
  { id: 'lyrics', label: 'Lyrics', icon: FileText, href: '/music/lyrics', param: null },
  { id: 'karaoke', label: 'Karaoke', icon: Mic, href: '/music/karaoke', param: null },
];

export default function TabsNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const getActiveTab = () => {
    if (pathname === '/music/ai-studio') return 'ai-studio';
    if (pathname === '/music/lyrics') return 'lyrics';
    if (pathname === '/music/karaoke') return 'karaoke';
    if (pathname === '/music/library') return 'library';
    if (currentTab === 'trending') return 'trending';
    if (currentTab === 'liked') return 'liked';
    if (currentTab === 'recent') return 'recent';
    return 'discover';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab) => {
    if (tab.param) {
      router.push(`${tab.href}?tab=${tab.param}`);
    } else {
      router.push(tab.href);
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => handleTabClick(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              isActive
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
