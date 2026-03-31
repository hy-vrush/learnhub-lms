import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContentType = 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT';
export type SourceType = 'DYNAMIC' | 'STATIC';
export type VideoSource = 'DIRECT' | 'YOUTUBE' | 'CLOUDINARY' | 'GOOGLE_DRIVE';

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  source: SourceType;
  videoSource?: VideoSource;
  url: string;
  localPath?: string;
  isLocked: boolean;
}

export interface Module {
  id: string;
  title: string;
  defaultType: SourceType;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  batch: string;
  thumbnailUrl: string;
  description: string;
  modules: Module[];
  isPublished: boolean;
}

interface LMSState {
  courses: Course[];
  isAdmin: boolean;
  sheetLink: string;
  
  setAdmin: (isAdmin: boolean) => void;
  setSheetLink: (link: string) => void;
  syncWithSheets: () => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  clearDuplicates: () => void;
}

export const useLMSStore = create<LMSState>()(
  persist(
    (set, get) => ({
      courses: [],
      isAdmin: false,
      sheetLink: '',

      setAdmin: (isAdmin) => set({ isAdmin }),
      setSheetLink: (link) => set({ sheetLink: link }),
      syncWithSheets: () => {
        // Mock sync logic
        console.log('Syncing with sheets:', get().sheetLink);
      },
      addCourse: (course) => set((state) => {
        const courses = state.courses || [];
        if (courses.some(c => c.id === course.id)) return state;
        return { courses: [...courses, course] };
      }),
      updateCourse: (course) => set((state) => ({
        courses: (state.courses || []).map(c => c.id === course.id ? course : c)
      })),
      deleteCourse: (id) => set((state) => ({
        courses: (state.courses || []).filter(c => c.id !== id)
      })),
      clearDuplicates: () => set((state) => {
        const courses = state.courses || [];
        const uniqueCourses = Array.from(new Map(courses.map(c => [c.id, c])).values());
        if (uniqueCourses.length === courses.length) return state;
        return { courses: uniqueCourses };
      })
    }),
    {
      name: 'study-lms-storage',
    }
  )
);
