'use client';

import { useState } from 'react';
import { 
  X, 
  Menu, 
  BookOpen, 
  Clock, 
  Code, 
  MonitorPlay, 
  FileText,
  GraduationCap,
  Folder,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Maximize,
  Play,
  Settings,
  RotateCcw,
  FastForward,
  Rewind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './Sidebar';

export const LearningView = ({ course, onBack }: any) => {
  const [activeLesson, setActiveLesson] = useState<any>(course.modules[0]?.lessons[0] || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'code'>('content');

  // Mock code topics
  const MOCK_CODE_TOPICS = [
    {
      id: 'c1',
      title: 'JavaScript Fundamentals',
      lessons: [
        { id: 'cl1', title: 'Let vs Const', type: 'VIDEO', source: 'DYNAMIC', url: 'https://www.w3schools.com/html/mov_bbb.mp4', isLocked: false },
        { id: 'cl2', title: 'Primitive Types', type: 'VIDEO', source: 'DYNAMIC', url: 'https://www.w3schools.com/html/mov_bbb.mp4', isLocked: false },
      ]
    }
  ];

  const getEmbedUrl = (lesson: any) => {
    if (!lesson.url) return null;
    
    const source = lesson.videoSource || 'DIRECT';
    
    if (source === 'YOUTUBE') {
      // Handle various YouTube URL formats
      let videoId = '';
      let url = lesson.url;
      
      // If user pasted the whole iframe tag, extract the src
      if (url.includes('<iframe') && url.includes('src="')) {
        const match = url.match(/src="([^"]+)"/);
        if (match) url = match[1];
      }

      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else if (url.includes('playlist?list=')) {
        const playlistId = url.split('list=')[1].split('&')[0];
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1`;
      } else {
        videoId = url; // Assume it's already an ID
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`;
    }
    
    if (source === 'GOOGLE_DRIVE') {
      // Handle Google Drive share links
      let fileId = '';
      const url = lesson.url;
      
      if (url.includes('/folders/')) {
        fileId = url.split('/folders/')[1].split('?')[0].split('/')[0];
        return `https://drive.google.com/embeddedfolderview?id=${fileId}#grid`;
      }
      
      if (url.includes('/d/')) {
        fileId = url.split('/d/')[1].split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      } else {
        fileId = url;
      }
      // Google Drive doesn't support autoplay parameter in preview mode easily, 
      // but we'll use the standard preview URL.
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    if (source === 'CLOUDINARY') {
      // Handle Cloudinary embed URLs or public IDs
      const url = lesson.url;
      if (url.includes('player.cloudinary.com/embed')) {
        // Append autoplay if not present
        if (!url.includes('autoplay=')) {
          return url.includes('?') ? `${url}&autoplay=true&muted=true` : `${url}?autoplay=true&muted=true`;
        }
        return url;
      }
      return url;
    }
    
    return lesson.url;
  };

  const isEmbedSource = (source: string) => ['YOUTUBE', 'GOOGLE_DRIVE', 'CLOUDINARY'].includes(source);

  return (
    <div className="fixed inset-0 bg-[#050811] z-[60] flex flex-col text-slate-200">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#050811] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <button className="px-4 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:bg-white/10 transition-all">
            <ChevronLeft size={12} /> PREV
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">NOW PLAYING</div>
          <div className="text-xs font-bold text-slate-200">{activeLesson?.title || 'Select a lesson'}</div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 cursor-not-allowed">
            NEXT <ChevronRight size={12} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "border-r border-white/5 bg-[#050811] transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-80" : "w-0 opacity-0 pointer-events-none"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
                <h2 className="font-bold text-xs text-slate-200 truncate">{course.title}</h2>
              </div>
              <span className="text-blue-500 text-[10px] font-black">{course.progress || 0}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${course.progress || 0}%` }} />
            </div>
          </div>

          <div className="p-4 flex items-center gap-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <Folder size={14} className="fill-blue-400/20" /> MODULES
            </div>
            <div className="ml-auto text-[10px] font-black text-blue-400">
              {course.modules?.length || 0}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            <SidebarItem 
              item={{ id: 'root', title: 'Course Content', modules: course.modules }} 
              activeId={activeLesson?.id} 
              onSelect={setActiveLesson}
              type="root"
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#080c18] overflow-hidden relative flex flex-col">
          <div className="flex-1 flex items-center justify-center p-2 md:p-6">
            <div className="w-full h-full relative group">
              {activeLesson ? (
                <div className="w-full h-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                  {activeLesson.url ? (
                    activeLesson.type?.toUpperCase() === 'VIDEO' ? (
                      isEmbedSource(activeLesson.videoSource || 'DIRECT') ? (
                        <iframe 
                          key={activeLesson.id}
                          src={getEmbedUrl(activeLesson)} 
                          className="w-full h-full border-none" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full bg-black relative group/player">
                          <video 
                            key={activeLesson.id}
                            src={activeLesson.url} 
                            className="w-full h-full object-contain" 
                            poster="https://picsum.photos/seed/video/1200/800"
                            controls
                            autoPlay
                            muted
                            playsInline
                          />
                        </div>
                      )
                    ) : (
                      <iframe 
                        key={activeLesson.id}
                        src={getEmbedUrl(activeLesson)} 
                        className="w-full h-full border-none" 
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                      Lesson content not available
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full glass rounded-3xl flex flex-col items-center justify-center text-slate-600 border border-white/10">
                  <BookOpen size={64} className="opacity-10 mb-6" />
                  <h3 className="text-2xl font-black tracking-tighter mb-2">Ready to Learn?</h3>
                  <p className="text-xs font-bold uppercase tracking-widest">Select a lesson from the sidebar to begin</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
