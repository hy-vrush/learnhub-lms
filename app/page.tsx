'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Settings, 
  Users, 
  BookOpen, 
  Edit3, 
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  Trophy,
  Star,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { useLMSStore, Course } from '@/lib/store';
import EditCourseModal from '@/components/EditCourseModal';
import { Navbar } from '@/components/Navbar';
import { LearningView } from '@/components/CourseView';
import { AdminPanel } from '@/components/AdminPanel';

const INITIAL_COURSES: Course[] = [
  {
    id: 'lms-demo',
    title: 'Study LMS Demo',
    batch: 'Feature Showcase 1.0',
    description: 'A comprehensive showcase of all Study LMS features including YouTube, Google Drive, Cloudinary, and Static uploads.',
    thumbnailUrl: 'https://picsum.photos/seed/demo/800/450',
    isPublished: true,
    modules: [
      {
        id: 'm-yt',
        title: 'YouTube Integration',
        defaultType: 'DYNAMIC',
        lessons: [
          { 
            id: 'l-yt-1', 
            title: 'YouTube: Simple Link', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'YOUTUBE',
            url: 'https://youtu.be/OWShOZTNCpk?si=olKeyoWH5d1idvN_', 
            isLocked: false 
          },
          { 
            id: 'l-yt-2', 
            title: 'YouTube: Embed Code', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'YOUTUBE',
            url: '<iframe width="560" height="315" src="https://www.youtube.com/embed/OWShOZTNCpk?si=LAhI4TyJ7VtvX35N" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>', 
            isLocked: false 
          },
          { 
            id: 'l-yt-3', 
            title: 'YouTube: Full Playlist', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'YOUTUBE',
            url: 'https://www.youtube.com/playlist?list=PLfqMhTWNBTe2C_dQAP1UoemcgAxBTlItp', 
            isLocked: false 
          },
        ]
      },
      {
        id: 'm-gdrive',
        title: 'Google Drive Integration',
        defaultType: 'DYNAMIC',
        lessons: [
          { 
            id: 'l-gd-1', 
            title: 'Drive: Direct Video', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'GOOGLE_DRIVE',
            url: 'https://drive.google.com/file/d/1f89KcHstfv-Nl7tp_rLHDyV21e6HbOqM/view?usp=drive_link', 
            isLocked: false 
          },
          { 
            id: 'l-gd-2', 
            title: 'Drive: Resource Folder', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'GOOGLE_DRIVE',
            url: 'https://drive.google.com/drive/folders/1HiPGfNydpWKwrDJ5JN6o3WzxQ8zFNbnz?usp=drive_link', 
            isLocked: false 
          },
          { 
            id: 'l-gd-3', 
            title: 'Drive: PDF Document', 
            type: 'PDF', 
            source: 'DYNAMIC', 
            videoSource: 'GOOGLE_DRIVE',
            url: 'https://drive.google.com/file/d/17WXznpPDf8UqOWMLV-LAAfodj-lwTG-3/view', 
            isLocked: false 
          },
        ]
      },
      {
        id: 'm-cloudinary',
        title: 'Cloudinary Integration',
        defaultType: 'DYNAMIC',
        lessons: [
          { 
            id: 'l-cl-1', 
            title: 'Cloudinary: Embedded Player', 
            type: 'VIDEO', 
            source: 'DYNAMIC', 
            videoSource: 'CLOUDINARY',
            url: 'https://player.cloudinary.com/embed/?cloud_name=duad2kq0p&public_id=Course_Objective_lkf0zu', 
            isLocked: false 
          },
        ]
      },
      {
        id: 'm-static',
        title: 'Static & Direct Uploads',
        defaultType: 'STATIC',
        lessons: [
          { 
            id: 'l-st-1', 
            title: 'Static: Direct MP4 Link', 
            type: 'VIDEO', 
            source: 'STATIC', 
            videoSource: 'DIRECT',
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
            isLocked: false 
          },
          { 
            id: 'l-st-2', 
            title: 'Static: PDF Resource', 
            type: 'PDF', 
            source: 'STATIC', 
            url: 'https://pdfobject.com/pdf/sample.pdf', 
            isLocked: false 
          },
        ]
      }
    ]
  }
];

export default function LMSApp() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'admin' | 'course-view'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { courses, isAdmin, setAdmin, addCourse, updateCourse, deleteCourse, clearDuplicates } = useLMSStore();

  useEffect(() => {
    clearDuplicates();
    if (courses.length === 0) {
      INITIAL_COURSES.forEach(addCourse);
    }
  }, [addCourse, clearDuplicates, courses.length]);

  const handleLogin = (asAdmin: boolean = true) => {
    setIsLoggedIn(true);
    setAdmin(asAdmin);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdmin(false);
    setView('landing');
  };

  const handleContinueLearning = (course: Course) => {
    setSelectedCourse(course);
    setView('course-view');
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (updatedCourse: Course) => {
    updateCourse(updatedCourse);
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleNewCourse = () => {
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Course',
      batch: 'Batch 1.0',
      thumbnailUrl: 'https://picsum.photos/seed/new/800/450',
      description: 'Add a description for your new course.',
      isPublished: false,
      modules: []
    };
    addCourse(newCourse);
    handleEditClick(newCourse);
  };

  return (
    <div className="min-h-screen bg-[#050811] selection:bg-blue-500/30 text-slate-200">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        isAdmin={isAdmin}
        setView={(v: any) => setView(v === 'admin' ? 'admin' : v === 'dashboard' ? 'dashboard' : 'landing')}
      />

      <main className="relative">
        {view === 'landing' && (
          <div className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={12} className="animate-pulse" />
                  New: LearnHub 1.0 is here
                </div>
                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                  Master Skills with <span className="text-blue-500">Study LMS Hub</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed">
                  Premium learning experience designed for the next generation of developers. 
                </p>
                <div className="flex flex-wrap gap-5">
                  <button onClick={() => handleLogin(false)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all flex items-center gap-2">
                    User Login <ArrowRight size={20} />
                  </button>
                  <button onClick={() => handleLogin(true)} className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-sm transition-all flex items-center gap-2">
                    Admin Login <Settings size={20} />
                  </button>
                </div>
              </motion.div>
              <div className="relative">
                <div className="aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 relative group">
                  <Image src="https://picsum.photos/seed/lms/1200/800" alt="LMS" fill className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer">
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white tracking-tighter">Student Dashboard</h1>
              <button onClick={() => setView('admin')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-blue-400 font-bold rounded-lg text-xs uppercase tracking-widest">
                <Settings size={16} /> Admin Panel
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {courses?.map(course => (
                <div key={course.id} className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all">
                  <div className="aspect-video relative">
                    <Image 
                      src={course.thumbnailUrl || 'https://picsum.photos/seed/placeholder/800/450'} 
                      alt={course.title} 
                      fill 
                      className="object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="font-black text-xl text-white">{course.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                    <button 
                      onClick={() => handleContinueLearning(course)}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 transition-all"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'admin' && (
          <AdminPanel onBack={() => setView('dashboard')} />
        )}

        {view === 'course-view' && selectedCourse && (
          <LearningView 
            course={selectedCourse} 
            onBack={() => setView('dashboard')} 
          />
        )}
      </main>

      {editingCourse && (
        <EditCourseModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          course={editingCourse}
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
}
