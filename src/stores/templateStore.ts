import { create } from 'zustand';
import type { PromptTemplate, CreateTemplate, UpdateTemplate } from '../lib/types';
import * as cmd from '../lib/tauri-commands';

interface TemplateState {
    templates: PromptTemplate[];
    loading: boolean;

    fetchTemplates: () => Promise<void>;
    createTemplate: (input: CreateTemplate) => Promise<PromptTemplate>;
    updateTemplate: (id: string, input: UpdateTemplate) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
    templates: [],
    loading: false,

    fetchTemplates: async () => {
        set({ loading: true });
        const templates = await cmd.listTemplates();
        set({ templates, loading: false });
    },

    createTemplate: async (input) => {
        const template = await cmd.createTemplate(input);
        set({ templates: [template, ...get().templates] });
        return template;
    },

    updateTemplate: async (id, input) => {
        const updated = await cmd.updateTemplate(id, input);
        set({
            templates: get().templates.map((t) => (t.id === id ? updated : t)),
        });
    },

    deleteTemplate: async (id) => {
        await cmd.deleteTemplate(id);
        set({
            templates: get().templates.filter((t) => t.id !== id),
        });
    },
}));
