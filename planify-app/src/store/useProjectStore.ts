import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { PagePreset, TemplateLayout, TemplateState } from '@/types/editor';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  floor_name: string | null;
  canvas_data: unknown;
  scale_config: unknown;
  thumbnail_url: string | null;
  is_template: boolean;
  template_category: string | null;
  template_layout_id?: string | null;
  page_preset?: PagePreset | null;
  template_state?: TemplateState | null;
  created_at: string;
  updated_at: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Bilinmeyen hata';

interface ProjectState {
  projects: Project[];
  templateLayouts: TemplateLayout[];
  isLoading: boolean;
  isLoadingTemplates: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchTemplateLayouts: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
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

      set({ templateLayouts: data as TemplateLayout[], isLoadingTemplates: false });
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
