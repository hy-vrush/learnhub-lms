'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Plus, 
  Code, 
  Settings, 
  X, 
  ChevronRight, 
  Database, 
  Globe,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLMSStore, Course, Module, Lesson } from '@/lib/store';
import EditCourseModal from './EditCourseModal';

export const AdminPanel = ({ onBack }: any) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { courses, sheetLink, setSheetLink, syncWithSheets, addCourse, updateCourse } = useLMSStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCourse = (type: 'STATIC' | 'DYNAMIC') => {
    setShowCreateModal(false);
    if (type === 'DYNAMIC') {
      const newId = `course-${Date.now()}`;
      const newCourse: Course = {
        id: newId,
        title: 'New Dynamic Course',
        batch: 'Sigma 1.0',
        description: 'A new dynamic course description.',
        thumbnailUrl: 'https://picsum.photos/seed/' + newId + '/800/450',
        isPublished: false,
        modules: []
      };
      addCourse(newCourse);
      setSelectedCourse(newCourse);
      setShowSettings(true);
    } else {
      // Trigger folder upload for static course
      if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    }
  };

  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
    }
  }, []);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const rootFolderName = files[0].webkitRelativePath.split('/')[0] || 'New Static Course';

    // Group files by their immediate parent folder (which will be the module name)
    const modulesMap = new Map<string, Lesson[]>();

    fileArray.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      // Root/Module/File.ext -> pathParts is [Root, Module, File.ext]
      if (pathParts.length < 2) return; // Skip files in root for now, or handle them as a default module

      const moduleName = pathParts.length === 2 ? 'Introduction' : pathParts[1];
      const isSupported = file.type.startsWith('video/') || 
                          file.type === 'application/pdf' ||
                          file.name.toLowerCase().endsWith('.mp4') ||
                          file.name.toLowerCase().endsWith('.pdf');

      if (isSupported) {
        const lesson: Lesson = {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.startsWith('video/') ? 'VIDEO' : 'PDF',
          source: 'STATIC',
          videoSource: 'DIRECT',
          url: URL.createObjectURL(file),
          localPath: file.webkitRelativePath,
          isLocked: false
        };

        if (!modulesMap.has(moduleName)) {
          modulesMap.set(moduleName, []);
        }
        modulesMap.get(moduleName)?.push(lesson);
      }
    });

    if (modulesMap.size === 0) {
      alert('No supported files (MP4, PDF) found in the selected folder structure.');
      return;
    }

    const newModules: Module[] = Array.from(modulesMap.entries()).map(([title, lessons]) => ({
      id: Math.random().toString(36).substr(2, 9),
      title,
      defaultType: 'STATIC',
      lessons
    }));

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: rootFolderName,
      batch: 'Static Import',
      description: `Course imported from local folder: ${rootFolderName}. Contains ${newModules.length} modules.`,
      thumbnailUrl: 'https://picsum.photos/seed/' + rootFolderName + '/800/450',
      isPublished: false,
      modules: newModules
    };

    addCourse(newCourse);
    setSelectedCourse(newCourse);
    setShowSettings(true);
    alert(`Successfully imported "${rootFolderName}" with ${newModules.length} modules.`);
    
    // Reset input
    event.target.value = '';
  };

  const handleSaveSettings = (updatedCourse: Course) => {
    updateCourse(updatedCourse);
    setShowSettings(false);
  };

  const handleAddRootFolder = () => {
    console.log('Root folder creation will be available in the next update. For now, please use the "New Course" button to create a course with a default structure.');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Course Management', icon: BookOpen },
    { id: 'folders', label: 'Folder Structure', icon: Plus },
    { id: 'topics', label: 'Topics Management', icon: Code },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-background z-[70] flex text-slate-200">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-card border-r border-white/5 flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-admin rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-admin/20">A</div>
          <div>
            <span className="font-black text-lg tracking-tighter block">Admin Hub</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">v1.0.4 Premium</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-admin text-white shadow-lg shadow-admin/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Globe size={14} /> Create New Site
          </button>
          <button onClick={onBack} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
            Exit Admin Portal
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto p-10 relative scrollbar-hide">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="text-admin text-[10px] font-black uppercase tracking-[0.3em] mb-3">Management Console</div>
            <h1 className="text-4xl font-black tracking-tighter capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <Database size={18} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Google Sheet Link" 
                className="text-xs font-bold outline-none w-64 bg-transparent"
                value={sheetLink || ''}
                onChange={(e) => setSheetLink(e.target.value)}
              />
              <button 
                onClick={syncWithSheets}
                className="px-3 py-1.5 bg-admin/10 text-admin rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-admin hover:text-white transition-all"
              >
                Sync
              </button>
            </div>
            <button 
              onClick={() => folderInputRef.current?.click()}
              className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Upload size={16} className="text-blue-400" /> Upload Static Folder
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-admin text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin/90 transition-all shadow-xl shadow-admin/20 flex items-center gap-2"
            >
              <Plus size={16} /> New Course
            </button>
            <input 
              type="file" 
              ref={folderInputRef} 
              className="hidden" 
              onChange={handleFolderUpload}
            />
          </div>
        </header>

        {/* Create Course Type Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-card w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden p-10 text-center"
              >
                <div className="w-20 h-20 bg-admin/10 rounded-full flex items-center justify-center mx-auto mb-6 text-admin">
                  <Plus size={40} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-2">Create New Course</h3>
                <p className="text-slate-500 text-sm mb-8">Choose how you want to build your course content.</p>
                
                <div className="grid gap-4">
                  <button 
                    onClick={() => handleCreateCourse('STATIC')}
                    className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-admin/50 hover:bg-admin/5 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-lg tracking-tight group-hover:text-admin transition-colors">Static Folder</span>
                      <Plus size={20} className="text-slate-600 group-hover:text-admin" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Upload a complete folder structure. Subfolders become modules, and files become lessons.</p>
                  </button>

                  <button 
                    onClick={() => handleCreateCourse('DYNAMIC')}
                    className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-student/50 hover:bg-student/5 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-lg tracking-tight group-hover:text-student transition-colors">Dynamic Course</span>
                      <Globe size={20} className="text-slate-600 group-hover:text-student" />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Build your course manually using YouTube, Google Drive, or Cloudinary links.</p>
                  </button>
                </div>

                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {activeTab === 'courses' ? (
          <div className="grid gap-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search courses..." 
                    className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-admin/50 w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                  <Filter size={14} /> Filter
                </button>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Showing {courses.length} Courses
              </div>
            </div>

            {courses?.map(course => (
              <div key={course.id} className="glass p-6 rounded-[2rem] flex items-center gap-8 group hover:border-admin/30 transition-all duration-500">
                <div className="relative w-48 aspect-video rounded-2xl overflow-hidden shrink-0">
                  <Image 
                    src={course.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/450'} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={course.title} 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-xl tracking-tight">{course.title}</h3>
                    <span className={cn(
                      "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest",
                      course.isPublished ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-1 leading-relaxed mb-4">{course.description}</p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-admin" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{course.batch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-student" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">12 Modules</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowSettings(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Settings size={18} />
                  </button>
                  <button className="bg-white text-background px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-admin hover:text-white transition-all">
                    Edit Content
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'folders' ? (
          <div className="glass p-10 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-black text-2xl tracking-tighter">Folder Structure</h2>
                <p className="text-slate-500 text-sm">Organize your course hierarchy and content flow.</p>
              </div>
              <button 
                onClick={handleAddRootFolder}
                className="bg-white text-background px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-admin hover:text-white transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Root Folder
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-admin/5 border border-admin/20 rounded-[1.5rem] flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-admin rounded-2xl flex items-center justify-center text-white shadow-lg shadow-admin/20">
                    <Plus size={24} />
                  </div>
                  <div>
                    <div className="font-black text-lg tracking-tight">Main Course Folder</div>
                    <div className="text-[10px] text-admin font-black uppercase tracking-widest mt-1">Color: Red | Priority: 1 | Root</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white"><Settings size={16} /></button>
                  <button className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white"><X size={16} /></button>
                </div>
              </div>
              
              <div className="ml-12 p-6 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-between group hover:border-student/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                    <ChevronRight size={20} />
                  </div>
                  <div>
                    <div className="font-black text-base tracking-tight">Module 1: Getting Started</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Dynamic Link</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[9px] text-student font-black uppercase tracking-widest">Cloudflare Stream</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white"><ExternalLink size={14} /></button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white"><Settings size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-[3rem] p-20 text-center border-2 border-dashed border-white/5">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-700">
              <LayoutDashboard size={48} />
            </div>
            <h2 className="font-black text-3xl tracking-tighter mb-4">Section Under Development</h2>
            <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">This admin module is currently being built to provide full control over your LMS platform. Stay tuned for advanced analytics and content tools.</p>
          </div>
        )}

        {/* Course Settings Modal */}
        {showSettings && selectedCourse && (
          <EditCourseModal 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            course={selectedCourse}
            onSave={handleSaveSettings}
          />
        )}
      </main>
    </div>
  );
};
