'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  MonitorPlay, 
  FileText, 
  BookOpen,
  Plus,
  Folder,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SidebarItem = ({ item, level = 0, activeId, onSelect, type = 'lesson' }: any) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isFolder = 'topics' in item || 'lessons' in item || 'modules' in item;
  const isActive = activeId === item.id;

  const getIcon = () => {
    if (type === 'root') return <Plus size={16} className="text-slate-400" />;
    if (type === 'module') return <Folder size={16} className="text-student" />;
    const itemType = item.type?.toUpperCase();
    if (itemType === 'VIDEO') return <Play size={12} className="text-slate-500" />;
    if (itemType === 'PDF') return <FileText size={12} className="text-slate-500" />;
    return <BookOpen size={12} className="text-slate-500" />;
  };

  const getStatusIcon = () => {
    if (item.status === 'completed') return <CheckCircle2 size={16} className="text-student" />;
    return <Circle size={16} className="text-slate-700" />;
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          else onSelect(item);
        }}
        className={cn(
          "flex items-center gap-3 py-2.5 px-4 cursor-pointer transition-all text-xs",
          isActive ? "bg-blue-600/10 text-blue-400 font-bold border-l-2 border-blue-600" : "hover:bg-white/5 text-slate-400",
          level > 0 && "pl-8",
          type === 'module' && "bg-white/5 mb-1 py-3"
        )}
      >
        {isFolder ? (
          <ChevronRight size={14} className={cn("transition-transform text-slate-500", isOpen && "rotate-90")} />
        ) : (
          <div className={cn(
            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
            isActive ? "border-blue-500 bg-blue-500/20" : "border-slate-700"
          )}>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </div>
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          <span className={cn("truncate", isActive ? "text-blue-400" : "text-slate-300")}>{item.title}</span>
          {!isFolder && (
            <div className="flex items-center gap-2 mt-0.5">
              {item.type?.toUpperCase() === 'VIDEO' ? (
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Play size={8} className="fill-slate-500" /> 0:00
                </span>
              ) : item.type?.toUpperCase() === 'PDF' ? (
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <FileText size={8} /> PDF
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <BookOpen size={8} /> LESSON
                </span>
              )}
            </div>
          )}
        </div>
        
        {type === 'module' && <span className="text-[10px] font-black text-slate-600">0/3</span>}
      </div>
      
      {isOpen && isFolder && (
        <div className="overflow-hidden mt-1">
          {(item.modules || item.lessons || []).map((child: any) => (
            <SidebarItem 
              key={child.id} 
              item={child} 
              level={level + 1} 
              activeId={activeId} 
              onSelect={onSelect}
              type={item.modules ? 'module' : 'lesson'}
            />
          ))}
        </div>
      )}
    </div>
  );
};
