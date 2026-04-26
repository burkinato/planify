'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText, Clock, ExternalLink, Loader2, Trash2, ShieldCheck, FolderGit2, Pencil, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TemplateSelectorModal } from '@/components/editor/TemplateSelectorModal';
import type { PagePreset, TemplateLayout } from '@/types/editor';

export default function DashboardPage() {
  const { projects, isLoading, fetchProjects, createProject, deleteProject, updateProject } = useProjectStore();
  const { profile } = useAuthStore();
  const router = useRouter();
  
  const isPro = profile?.subscription_tier === 'pro';
  const [isCreating, setIsCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');

  // New Project Flow States
  const [showNameModal, setShowNameModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStartCreation = () => {
    setNewProjectTitle('Yeni Tahliye Planı');
    setShowNameModal(true);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    setShowNameModal(false);
    setShowTemplateModal(true);
  };

  const handleCreateNew = async (layout: TemplateLayout | null, preset: PagePreset) => {
    setIsCreating(true);
    setShowTemplateModal(false);
    
    try {
      const newProj = await createProject({
        title: newProjectTitle.trim() || 'Yeni Tahliye Planı',
        floor_name: 'Zemin Kat',
        canvas_data: null,
        scale_config: { pixelsPerMeter: 50, unit: 'm' },
        page_preset: preset,
        template_state: {},
      });
      
      if (newProj) {
        router.push(`/editor?id=${newProj.id}${layout ? `&template=${layout.slug}` : ''}`);
      }
    } catch {
      toast.error('Proje oluşturulamadı');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!renamingTitle.trim()) return;
    try {
      await updateProject(id, { title: renamingTitle.trim() });
      toast.success('Proje adı güncellendi');
      setRenamingId(null);
    } catch {
      toast.error('Ad değiştirilemedi');
    }
  };

  const calculateDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Dün';
    return `${days} gün önce`;
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Toplam Proje</div>
              <div className="text-2xl font-black text-slate-900">{projects.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>

          <div className={cn(
            "rounded-2xl p-5 border shadow-lg flex items-center justify-between transition-all",
            isPro 
              ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-500 shadow-indigo-900/10 text-white" 
              : "bg-white border-slate-200 shadow-sm text-slate-800"
          )}>
            <div>
              <div className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-1",
                isPro ? "text-indigo-100" : "text-slate-500"
              )}>Mevcut Plan</div>
              <div className="text-xl font-black flex items-center gap-2">
                {isPro ? (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Planify Pro
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-blue-600" /> Ücretsiz
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              {!isPro && (
                <Link
                  href="/dashboard/upgrade"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95 inline-block"
                >
                  Pro&apos;ya Geç
                </Link>
              )}
              {isPro && (
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Aktif
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Son Projeler</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20 w-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              
              {/* Create New Card */}
              <button 
                onClick={handleStartCreation}
                disabled={isCreating}
                className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center min-h-[180px] gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                      <span className="text-xl font-light mb-1">+</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">Yeni Proje Oluştur</span>
                  </>
                )}
              </button>

              {/* Project Cards */}
              {projects.map((project) => (
                <div key={project.id} className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col overflow-hidden">
                  <div className="h-28 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative group-hover:bg-blue-50/50 transition-colors">
                    {project.thumbnail_url ? (
                      <Image src={project.thumbnail_url} alt={project.title} fill className="object-cover" unoptimized />
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300 group-hover:text-blue-300 transition-colors" />
                    )}
                    
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link href={`/editor?id=${project.id}`} className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:-translate-y-0.5 text-white">
                        <ExternalLink className="w-3.5 h-3.5" /> Düzenle
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      {renamingId === project.id ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            autoFocus
                            aria-label="Proje adini yeniden adlandir"
                            value={renamingTitle}
                            onChange={(e) => setRenamingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(project.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="w-full bg-slate-50 border border-blue-500 rounded px-2 py-1 text-sm font-bold text-slate-800 outline-none"
                          />
                          <button onClick={() => handleRename(project.id)} className="text-green-600 p-1 hover:bg-green-50 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setRenamingId(null)} className="text-slate-400 p-1 hover:bg-slate-50 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1" title={project.title}>
                            {project.title}
                          </h4>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setRenamingId(project.id);
                                setRenamingTitle(project.title);
                              }}
                              className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors"
                              title="Yeniden Adlandır"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
                                  deleteProject(project.id);
                                }
                              }}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-auto pt-3">
                      <Clock className="w-3.5 h-3.5" /> {calculateDaysAgo(project.updated_at)} güncellendi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Name Input Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl animate-fade-in"
            onClick={() => setShowNameModal(false)}
          />
          
          <div className="relative w-full max-w-md animate-scale-in">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[32px] blur-2xl" />
            
            <div className="relative bg-white rounded-[28px] overflow-hidden shadow-2xl border border-slate-100">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Yeni Bir Başlangıç</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Harika bir proje için ilk adımı atın.</p>
                </div>

                <form onSubmit={handleNameSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">PROJE BAŞLIĞI</label>
                    <input
                      autoFocus
                      required
                      aria-label="Yeni proje adi"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                      placeholder="Projenize bir isim verin..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowNameModal(false)}
                      className="flex-1 py-3.5 rounded-xl font-bold text-xs text-slate-400 hover:text-slate-600 transition-all"
                    >
                      Vazgeç
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Oluşturmaya Başla <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <TemplateSelectorModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleCreateNew}
        />
      )}
    </>
  );
}
