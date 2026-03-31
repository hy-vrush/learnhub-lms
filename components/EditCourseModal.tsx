'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Lock, 
  Unlock, 
  FolderInput, 
  RefreshCw,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  GripVertical,
  Save,
  Upload
} from 'lucide-react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Course, Module, Lesson, VideoSource } from '@/lib/store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSave: (updatedCourse: Course) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onClose, course, onSave }) => {
  const [formData, setFormData] = useState<Course>(course);

  useEffect(() => {
    setFormData(course);
  }, [course]);

  const handleAddModule = () => {
    const newModule: Module = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Module',
      defaultType: 'DYNAMIC',
      lessons: []
    };
    setFormData({ ...formData, modules: [...formData.modules, newModule] });
  };

  const handleRemoveModule = (moduleId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter(m => m.id !== moduleId)
    });
  };

  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) => {
    setFormData({
      ...formData,
            modules: (formData.modules || []).map(m => m.id === moduleId ? { ...m, ...updates } : m)
    });
  };

  const handleAddLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Lesson',
      type: 'VIDEO',
      source: 'DYNAMIC',
      videoSource: 'DIRECT',
      url: '',
      isLocked: false
    };
    setFormData({
      ...formData,
      modules: (formData.modules || []).map(m => 
        m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m
      )
    });
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    setFormData({
      ...formData,
      modules: (formData.modules || []).map(m => 
        m.id === moduleId ? { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) } : m
      )
    });
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setFormData(prev => ({
      ...prev,
      modules: (prev.modules || []).map(m => 
        m.id === moduleId ? {
          ...m,
          lessons: (m.lessons || []).map(l => {
            if (l.id === lessonId) {
              const updated = { ...l, ...updates };
              // If source is changed to STATIC, ensure videoSource is DIRECT
              if (updates.source === 'STATIC') {
                updated.videoSource = 'DIRECT';
              }
              return updated;
            }
            return l;
          })
        } : m
      )
    }));
  };

  const handleFileUpload = (moduleId: string, lessonId: string, file: File) => {
    // Use URL.createObjectURL for session-based preview (fast, no state bloat)
    const url = URL.createObjectURL(file);
    handleUpdateLesson(moduleId, lessonId, { 
      url, 
      localPath: file.name 
    });
    
    // Note: In a production environment, you should upload to a server.
    // Local URLs are temporary and will not persist after page refresh.
    console.log(`File "${file.name}" ready for session preview. Path: ${file.webkitRelativePath || file.name}`);
  };

  const folderInputRef = React.useRef<HTMLInputElement>(null);

  // Set webkitdirectory attribute manually to ensure cross-browser support in React
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
    // Filter for common media types
    const supportedFiles = fileArray.filter(file => 
      file.type.startsWith('video/') || 
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.pdf')
    );

    if (supportedFiles.length === 0) {
      alert('No supported files (MP4, PDF) found in the selected folder.');
      return;
    }

    const folderName = files[0].webkitRelativePath.split('/')[0] || 'Local Import';
    
    const confirmImport = confirm(`Found ${supportedFiles.length} supported files in "${folderName}". Import as a new module?\n\nNote: Local files are for session preview only. For permanent hosting, please upload to a server or use cloud links.`);
    if (!confirmImport) return;

    try {
      const newLessons: Lesson[] = supportedFiles.map((file) => {
        // Use URL.createObjectURL for session-based preview
        const url = URL.createObjectURL(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.startsWith('video/') ? 'VIDEO' : 'PDF',
          source: 'STATIC',
          videoSource: 'DIRECT',
          url: url,
          localPath: file.webkitRelativePath || file.name,
          isLocked: false
        };
      });

      const newModule: Module = {
        id: Math.random().toString(36).substr(2, 9),
        title: folderName,
        defaultType: 'STATIC',
        lessons: newLessons
      };

      setFormData(prev => ({
        ...prev,
        modules: [...(prev.modules || []), newModule]
      }));

      alert(`Successfully imported module "${folderName}" with ${newLessons.length} lessons.`);
    } catch (error) {
      console.error('Folder import error:', error);
      alert('Failed to import folder. Please try again.');
    }
  };

  const handleImportPlaylist = (moduleId: string) => {
    const playlistUrl = prompt('Enter YouTube Playlist URL:');
    if (!playlistUrl) return;

    let playlistId = '';
    if (playlistUrl.includes('list=')) {
      playlistId = playlistUrl.split('list=')[1].split('&')[0];
    } else {
      alert('Invalid Playlist URL. Please make sure it contains "list="');
      return;
    }

    // Mock fetching playlist items
    // In a real app, you would call the YouTube Data API here
    const mockLessons: Lesson[] = [
      { id: Math.random().toString(36).substr(2, 9), title: 'Introduction to the Course', type: 'VIDEO', source: 'DYNAMIC', videoSource: 'YOUTUBE', url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${playlistId}`, isLocked: false },
      { id: Math.random().toString(36).substr(2, 9), title: 'Getting Started with Tools', type: 'VIDEO', source: 'DYNAMIC', videoSource: 'YOUTUBE', url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${playlistId}&index=2`, isLocked: false },
      { id: Math.random().toString(36).substr(2, 9), title: 'Core Concepts Deep Dive', type: 'VIDEO', source: 'DYNAMIC', videoSource: 'YOUTUBE', url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${playlistId}&index=3`, isLocked: false },
      { id: Math.random().toString(36).substr(2, 9), title: 'Advanced Techniques', type: 'VIDEO', source: 'DYNAMIC', videoSource: 'YOUTUBE', url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${playlistId}&index=4`, isLocked: false },
      { id: Math.random().toString(36).substr(2, 9), title: 'Final Project Overview', type: 'VIDEO', source: 'DYNAMIC', videoSource: 'YOUTUBE', url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${playlistId}&index=5`, isLocked: false },
    ];

    setFormData({
      ...formData,
      modules: (formData.modules || []).map(m => 
        m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), ...mockLessons] } : m
      )
    });

    alert(`Successfully imported ${mockLessons.length} lessons from the playlist!`);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${formData.title.replace(/\s+/g, '_')}_export.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importJsonRef = React.useRef<HTMLInputElement>(null);

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!importedData.title || !Array.isArray(importedData.modules)) {
          throw new Error('Invalid course data format. Missing title or modules array.');
        }

        // Check for path errors (missing URLs for static content)
        const errors: string[] = [];
        importedData.modules.forEach((mod: any) => {
          if (mod.lessons) {
            mod.lessons.forEach((lesson: any) => {
              if (lesson.source === 'STATIC' && (!lesson.url || lesson.url === '')) {
                const pathInfo = lesson.localPath ? `\n   Path: ${lesson.localPath}` : '';
                errors.push(`• Module: "${mod.title}" -> Lesson: "${lesson.title}"${pathInfo}`);
              }
            });
          }
        });

        // Preserve original course ID if importing into existing, or use imported ID
        const finalData = { ...importedData, id: course.id || importedData.id };
        setFormData(finalData);
        
        if (errors.length > 0) {
          alert(`Imported with ${errors.length} path errors for static content:\n\n${errors.join('\n')}\n\nPlease update these lessons with correct file paths or URLs.`);
        } else {
          alert('Course data imported successfully!');
        }
      } catch (err) {
        alert('Failed to import JSON: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
      // Reset input
      if (importJsonRef.current) importJsonRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newModules = [...formData.modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    setFormData({ ...formData, modules: newModules });
  };

  const moveLesson = (moduleId: string, index: number, direction: 'up' | 'down') => {
    setFormData({
      ...formData,
      modules: (formData.modules || []).map(m => {
        if (m.id !== moduleId) return m;
        const newLessons = [...m.lessons];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLessons.length) return m;
        [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];
        return { ...m, lessons: newLessons };
      })
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0a0f1d] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-slate-800 relative">
              <Image 
                src={formData.thumbnailUrl || 'https://picsum.photos/seed/placeholder/200/200'} 
                alt="Course" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{formData.title}</h2>
              <p className="text-sm text-slate-400">{formData.batch} • {formData.modules.length} Modules</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{formData.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={importJsonRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImportJSON} 
            />
            <button 
              onClick={() => importJsonRef.current?.click()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import JSON
            </button>
            <button 
              onClick={handleExportJSON}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Export JSON
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-sm font-medium rounded-lg transition-colors">
              Edit Details
            </button>
            <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors">
              Delete
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors ml-2">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Section 1: Course Metadata */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">1</div>
              <h3 className="text-lg font-semibold text-white">Course Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all text-white"
                  placeholder="Full Stack Web Development"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</label>
                <input 
                  type="text" 
                  value={formData.batch || ''}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all text-white"
                  placeholder="LearnHub 1.0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thumbnail URL</label>
              <input 
                type="text" 
                value={formData.thumbnailUrl || ''}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all text-white"
                placeholder="https://picsum.photos/seed/learnhub/400/225"
              />
            </div>
          </section>

          {/* Section 2: Modules & Content */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">2</div>
                <h3 className="text-lg font-semibold text-white">Modules & Content</h3>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={folderInputRef}
                  className="hidden" 
                  {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
                  onChange={handleFolderUpload}
                />
                <button 
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync / Import Folder
                </button>
                <button 
                  onClick={handleAddModule}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {formData.modules?.map((module, mIndex) => (
                <div key={module.id} className="bg-slate-900/30 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <FolderInput className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        value={module.title || ''}
                        onChange={(e) => handleUpdateModule(module.id, { title: e.target.value })}
                        className="bg-transparent border-none outline-none text-white font-bold text-lg w-full focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Default:</span>
                        <select 
                          value={module.defaultType}
                          onChange={(e) => handleUpdateModule(module.id, { defaultType: e.target.value as 'DYNAMIC' | 'STATIC' })}
                          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                        >
                          <option value="DYNAMIC">Dynamic (Links)</option>
                          <option value="STATIC">Static (Uploads)</option>
                        </select>
                      </div>
                      <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-white/10">
                        <button 
                          onClick={() => moveModule(mIndex, 'up')}
                          disabled={mIndex === 0}
                          className="p-1.5 hover:bg-white/5 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        </button>
                        <div className="w-[1px] h-4 bg-white/10" />
                        <button 
                          onClick={() => moveModule(mIndex, 'down')}
                          disabled={mIndex === formData.modules.length - 1}
                          className="p-1.5 hover:bg-white/5 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemoveModule(module.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-red-500/20"
                      >
                        <X className="w-3 h-3" />
                        Delete Module
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {module.lessons?.map((lesson, lIndex) => (
                      <div key={lesson.id} className="flex items-center gap-3 group">
                        <div className="flex items-center gap-2 bg-slate-900/80 border border-white/5 rounded-xl p-2 flex-1 shadow-sm">
                          <div className="flex items-center gap-2 px-2 border-r border-white/5">
                            <select 
                              value={lesson.type}
                              onChange={(e) => handleUpdateLesson(module.id, lesson.id, { type: e.target.value as any })}
                              className="bg-transparent text-blue-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="PDF">PDF</option>
                              <option value="QUIZ">Quiz</option>
                              <option value="ASSIGNMENT">Task</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-blue-400" />
                          </div>
                          
                          <div className="flex items-center gap-2 px-2 border-r border-white/5">
                            <select 
                              value={lesson.source}
                              onChange={(e) => handleUpdateLesson(module.id, lesson.id, { source: e.target.value as any })}
                              className="bg-transparent text-slate-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                              <option value="DYNAMIC">Dynamic</option>
                              <option value="STATIC">Static</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </div>

                          {lesson.type === 'VIDEO' && lesson.source === 'DYNAMIC' && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 px-2 border-r border-white/5">
                                <select 
                                  value={lesson.videoSource || 'DIRECT'}
                                  onChange={(e) => handleUpdateLesson(module.id, lesson.id, { videoSource: e.target.value as VideoSource })}
                                  className="bg-transparent text-emerald-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                                >
                                  <option value="DIRECT">Direct</option>
                                  <option value="YOUTUBE">YouTube</option>
                                  <option value="CLOUDINARY">Cloudinary</option>
                                  <option value="GOOGLE_DRIVE">Drive</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-emerald-400" />
                              </div>
                              {lesson.videoSource === 'GOOGLE_DRIVE' && (
                                <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] text-blue-400 font-bold uppercase tracking-tighter animate-pulse">
                                  ✨ Smart Embedding Active
                                </div>
                              )}
                            </div>
                          )}

                          {lesson.source === 'STATIC' && (
                            <div className="flex items-center gap-2 px-2 border-r border-white/5">
                              <label className="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer transition-colors border border-white/5">
                                <Upload className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upload File</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept={lesson.type === 'VIDEO' ? "video/*" : "*/*"}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(module.id, lesson.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          <input 
                            type="text" 
                            value={lesson.title || ''}
                            onChange={(e) => handleUpdateLesson(module.id, lesson.id, { title: e.target.value })}
                            className="bg-transparent border-none outline-none text-white text-sm font-medium flex-1 px-2 placeholder:text-slate-600"
                            placeholder="Lesson Title"
                          />

                          <div className="flex-1 max-w-[300px]">
                            <input 
                              type="text" 
                              value={lesson.url || ''}
                              onChange={(e) => handleUpdateLesson(module.id, lesson.id, { url: e.target.value })}
                              className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-400 outline-none focus:border-blue-500/30 transition-all font-mono truncate"
                              placeholder={lesson.source === 'STATIC' ? "File URL (uploaded automatically)" : "https://..."}
                            />
                          </div>

                          <div className="flex items-center gap-1 px-2 border-l border-white/5">
                            <button 
                              onClick={() => moveLesson(module.id, lIndex, 'up')}
                              disabled={lIndex === 0}
                              className="p-1 hover:bg-white/5 disabled:opacity-20 transition-colors"
                            >
                              <ChevronUp className="w-3 h-3 text-slate-500" />
                            </button>
                            <div className="w-[1px] h-3 bg-white/5" />
                            <button 
                              onClick={() => moveLesson(module.id, lIndex, 'down')}
                              disabled={lIndex === module.lessons.length - 1}
                              className="p-1 hover:bg-white/5 disabled:opacity-20 transition-colors"
                            >
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>

                          <button 
                            onClick={() => handleUpdateLesson(module.id, lesson.id, { isLocked: !lesson.isLocked })}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              lesson.isLocked ? "bg-amber-500/10 text-amber-500" : "hover:bg-white/5 text-slate-500"
                            )}
                          >
                            {lesson.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          <button 
                            onClick={() => handleRemoveLesson(module.id, lesson.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleImportPlaylist(module.id)}
                        className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest transition-colors pl-2"
                      >
                        <Video className="w-3 h-3" />
                        Import YT Playlist
                      </button>
                      <button 
                        onClick={() => handleAddLesson(module.id)}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-400 text-[10px] font-bold uppercase tracking-widest transition-colors pl-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end">
          <button 
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditCourseModal;
