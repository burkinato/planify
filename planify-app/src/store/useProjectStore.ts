import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuditStatus } from '@/lib/projects/compliance';
import { validateTemplateLayout } from '@/lib/editor/templateLayouts';
import type { PagePreset, TemplateLayout, TemplateState } from '@/types/editor';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  floor_name: string | null;
  client_name?: string | null;
  facility_name?: string | null;
  building_name?: string | null;
  canvas_data: unknown;
  scale_config: unknown;
  thumbnail_url: string | null;
  is_template: boolean;
  template_category: string | null;
  audit_status?: AuditStatus | null;
  last_exported_at?: string | null;
  compliance_score?: number | null;
  template_layout_id?: string | null;
  page_preset?: PagePreset | null;
  template_state?: TemplateState | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectExport {
  id: string;
  user_id: string;
  project_id: string;
  format: 'pdf' | 'png' | 'jpeg' | 'svg';
  file_name: string;
  created_at: string;
  projects?: {
    title?: string | null;
    client_name?: string | null;
    facility_name?: string | null;
  } | null;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Bilinmeyen hata';

interface ProjectState {
  projects: Project[];
  projectExports: ProjectExport[];
  templateLayouts: TemplateLayout[];
  isLoading: boolean;
  isLoadingTemplates: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProjectExports: () => Promise<void>;
  fetchTemplateLayouts: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  recordProjectExport: (projectId: string, format: ProjectExport['format'], fileName: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  projectExports: [],
  templateLayouts: [],
  isLoading: false,
  isLoadingTemplates: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ projects: data as Project[], isLoading: false });
    } catch (error: unknown) {
      console.error('Fetch projects error:', error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  fetchProjectExports: async () => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('project_exports')
        .select('*, projects(title, client_name, facility_name)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      set({ projectExports: (data || []) as ProjectExport[] });
    } catch (error: unknown) {
      console.error('Fetch project exports error:', error);
      set({ error: getErrorMessage(error) });
    }
  },

  fetchTemplateLayouts: async () => {
    if (get().isLoadingTemplates) {
      return;
    }

    set({ isLoadingTemplates: true, error: null });
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('template_layouts')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      set({ templateLayouts: (data as TemplateLayout[]).map(validateTemplateLayout), isLoadingTemplates: false });
    } catch (error: unknown) {
      console.error('Fetch template layouts error:', error);
      set({ error: getErrorMessage(error), isLoadingTemplates: false });
    }
  },

  createProject: async (projectData) => {
    const supabase = createClient();

    try {
      const authState = useAuthStore.getState();
      const userId = authState.user?.id ?? authState.session?.user.id;
      if (!userId) throw new Error('Oturum açılmamış.');

      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: userId }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newProject = data as Project;
      set((state) => ({ projects: [newProject, ...state.projects] }));
      return newProject;
    } catch (error: unknown) {
      console.error('Create project error:', error);
      set({ error: getErrorMessage(error) });
      return null;
    }
  },

  updateProject: async (id, projectData) => {
    const supabase = createClient();

    try {
      const authState = useAuthStore.getState();
      const userId = authState.user?.id ?? authState.session?.user.id;
      if (!userId) throw new Error('Projenizi kaydetmek için lütfen oturum açın.');

      const updateData: Partial<Project> = {
        ...projectData,
        updated_at: new Date().toISOString(),
      };

      if (
        typeof updateData.template_layout_id === 'string' &&
        updateData.template_layout_id.startsWith('fallback-')
      ) {
        updateData.template_layout_id = null;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? {
                ...project,
                ...projectData,
                updated_at: updateData.updated_at ?? project.updated_at,
              }
            : project
        ),
      }));
    } catch (error: unknown) {
      const projectError = error as {
        message?: string;
        code?: string;
        details?: string;
        hint?: string;
      };

      console.error('Update project failed!', {
        id,
        projectData,
        message: projectError.message,
        code: projectError.code,
        details: projectError.details,
        hint: projectError.hint,
      });
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  recordProjectExport: async (projectId, format, fileName) => {
    const supabase = createClient();

    try {
      const authState = useAuthStore.getState();
      const userId = authState.user?.id ?? authState.session?.user.id;
      if (!userId) throw new Error('Çıktı kaydı için lütfen oturum açın.');

      const exportedAt = new Date().toISOString();
      const { data, error } = await supabase
        .from('project_exports')
        .insert([{ user_id: userId, project_id: projectId, format, file_name: fileName }])
        .select('*, projects(title, client_name, facility_name)')
        .single();

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update({ last_exported_at: exportedAt, audit_status: 'exported' })
        .eq('id', projectId);

      if (updateError) {
        throw updateError;
      }

      set((state) => ({
        projectExports: [data as ProjectExport, ...state.projectExports].slice(0, 20),
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, last_exported_at: exportedAt, audit_status: 'exported' }
            : project
        ),
      }));
    } catch (error: unknown) {
      console.error('Record project export error:', error);
      set({ error: getErrorMessage(error) });
    }
  },

  deleteProject: async (id) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) {
        throw error;
      }

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }));
    } catch (error: unknown) {
      console.error('Delete project error:', error);
      set({ error: getErrorMessage(error) });
    }
  },
}));
