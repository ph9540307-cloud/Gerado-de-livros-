import { Injectable, signal, computed, effect } from '@angular/core';

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  isCompleted: boolean;
}

export interface BookProject {
  id: string;
  title: string;
  author: string;
  // Worldbuilding Metadata
  genre?: string;       // Gênero (Fantasia, Sci-fi, Romance...)
  setting?: string;     // Onde se passa / Mundo (Medieval, Cyberpunk, Brasil anos 90...)
  magicSystem?: string; // Sistema de Magia ou Tecnologia
  tone?: string;        // Tom (Sombrio, Humorístico, Épico...)
  
  chapters: Chapter[];
  notes: string;
  lastModified: number;
}

const DEFAULT_PROJECT: BookProject = {
  id: 'default-1',
  title: "Meu Primeiro Livro",
  author: "Autor Desconhecido",
  genre: "Geral",
  setting: "Indefinido",
  tone: "Neutro",
  notes: "",
  lastModified: Date.now(),
  chapters: [
    {
      id: 'c1',
      title: 'Capítulo 1: O Início',
      summary: 'O protagonista acorda em um lugar estranho. Ele percebe que não está sozinho.',
      content: '',
      isCompleted: false
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // State
  projects = signal<BookProject[]>([]);
  currentProjectId = signal<string | null>(null);
  currentChapterId = signal<string | null>(null);

  // Computed
  currentProject = computed(() => 
    this.projects().find(p => p.id === this.currentProjectId()) || null
  );

  currentChapter = computed(() => {
    const proj = this.currentProject();
    if (!proj) return null;
    return proj.chapters.find(c => c.id === this.currentChapterId()) || null;
  });

  totalWordCount = computed(() => {
    const proj = this.currentProject();
    if (!proj) return 0;
    return proj.chapters.reduce((acc, curr) => {
      return acc + (curr.content.trim().split(/\s+/).filter(w => w.length > 0).length);
    }, 0);
  });

  chapterWordCount = computed(() => {
    const c = this.currentChapter();
    if (!c) return 0;
    return c.content.trim().split(/\s+/).filter(w => w.length > 0).length;
  });

  constructor() {
    this.loadFromStorage();

    // Auto-save effect
    effect(() => {
      localStorage.setItem('livroguia_projects', JSON.stringify(this.projects()));
    });
  }

  private loadFromStorage() {
    // Try loading list of projects
    const savedProjects = localStorage.getItem('livroguia_projects');
    
    if (savedProjects) {
      this.projects.set(JSON.parse(savedProjects));
    } else {
      // Migration: Check for single project
      const oldProject = localStorage.getItem('livroguia_project');
      if (oldProject) {
        const p = JSON.parse(oldProject);
        // Add ID if missing
        if (!p.id) p.id = 'legacy-' + Date.now();
        if (!p.lastModified) p.lastModified = Date.now();
        this.projects.set([p]);
      } else {
        // Init with default
        this.projects.set([DEFAULT_PROJECT]);
      }
    }
  }

  // --- Library Actions ---

  createProject(data: {
    title: string; 
    author: string;
    genre?: string;
    setting?: string;
    magicSystem?: string;
    tone?: string;
  }) {
    const newProject: BookProject = {
      id: `proj-${Date.now()}`,
      title: data.title || 'Novo Livro',
      author: data.author || 'Eu',
      genre: data.genre || '',
      setting: data.setting || '',
      magicSystem: data.magicSystem || '',
      tone: data.tone || '',
      notes: '',
      lastModified: Date.now(),
      chapters: [
        {
          id: `c-${Date.now()}`,
          title: 'Capítulo 1',
          summary: '',
          content: '',
          isCompleted: false
        }
      ]
    };
    this.projects.update(list => [newProject, ...list]);
    this.openProject(newProject.id);
  }

  deleteProject(id: string) {
    this.projects.update(list => list.filter(p => p.id !== id));
    if (this.currentProjectId() === id) {
      this.currentProjectId.set(null);
    }
  }

  openProject(id: string) {
    this.currentProjectId.set(id);
    const proj = this.projects().find(p => p.id === id);
    if (proj && proj.chapters.length > 0) {
      this.currentChapterId.set(proj.chapters[0].id);
    }
  }

  closeProject() {
    this.currentProjectId.set(null);
    this.currentChapterId.set(null);
  }

  // --- Project Actions ---

  updateProjectMetadata(title: string, author: string) {
    const pid = this.currentProjectId();
    if (!pid) return;

    this.projects.update(list => list.map(p => 
      p.id === pid ? { ...p, title, author, lastModified: Date.now() } : p
    ));
  }

  updateNotes(notes: string) {
    const pid = this.currentProjectId();
    if (!pid) return;

    this.projects.update(list => list.map(p => 
      p.id === pid ? { ...p, notes, lastModified: Date.now() } : p
    ));
  }

  // --- Chapter Actions ---

  selectChapter(id: string) {
    this.currentChapterId.set(id);
  }

  addChapter() {
    const pid = this.currentProjectId();
    if (!pid) return;

    const newId = `c${Date.now()}`;
    this.projects.update(list => list.map(p => {
      if (p.id !== pid) return p;
      return {
        ...p,
        lastModified: Date.now(),
        chapters: [
          ...p.chapters,
          {
            id: newId,
            title: `Novo Capítulo ${p.chapters.length + 1}`,
            summary: 'Descreva o que acontece neste capítulo...',
            content: '',
            isCompleted: false
          }
        ]
      };
    }));
    
    // Auto select
    this.currentChapterId.set(newId);
  }

  updateChapter(id: string, updates: Partial<Chapter>) {
    const pid = this.currentProjectId();
    if (!pid) return;

    this.projects.update(list => list.map(p => {
      if (p.id !== pid) return p;
      return {
        ...p,
        lastModified: Date.now(),
        chapters: p.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
      };
    }));
  }

  deleteChapter(chapterId: string) {
    const pid = this.currentProjectId();
    if (!pid) return;

    const p = this.projects().find(proj => proj.id === pid);
    if (!p || p.chapters.length <= 1) return;

    this.projects.update(list => list.map(proj => {
      if (proj.id !== pid) return proj;
      return {
        ...proj,
        lastModified: Date.now(),
        chapters: proj.chapters.filter(c => c.id !== chapterId)
      };
    }));

    if (this.currentChapterId() === chapterId) {
      // Select first available
      const updatedProj = this.projects().find(proj => proj.id === pid);
      if (updatedProj && updatedProj.chapters.length > 0) {
        this.currentChapterId.set(updatedProj.chapters[0].id);
      }
    }
  }

  reorderChapter(chapterId: string, direction: 'up' | 'down') {
    const pid = this.currentProjectId();
    if (!pid) return;

    this.projects.update(list => list.map(proj => {
      if (proj.id !== pid) return proj;

      const index = proj.chapters.findIndex(c => c.id === chapterId);
      if (index === -1) return proj;
      if (direction === 'up' && index === 0) return proj;
      if (direction === 'down' && index === proj.chapters.length - 1) return proj;

      const newChapters = [...proj.chapters];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];

      return { ...proj, chapters: newChapters, lastModified: Date.now() };
    }));
  }

  downloadChapter(chapter: Chapter): void {
    const text = `${chapter.title}\n\n${chapter.content}`;
    this.downloadFile(text, `${chapter.title.replace(/\s+/g, '_')}.txt`);
  }

  exportBook(): void {
    const p = this.currentProject();
    if (!p) return;

    let text = `${p.title}\npor ${p.author}\n\n`;
    p.chapters.forEach(c => {
      text += `### ${c.title}\n\n${c.content}\n\n***\n\n`;
    });

    this.downloadFile(text, `${p.title.replace(/\s+/g, '_')}.txt`);
  }
  
  exportBookAsJson(): void {
    const p = this.currentProject();
    if (!p) return;
    this.exportProjectAsJson(p);
  }

  exportProjectAsJson(project: BookProject): void {
    const jsonContent = JSON.stringify(project, null, 2);
    this.downloadFile(jsonContent, `${project.title.replace(/\s+/g, '_')}_backup.json`, 'application/json');
  }

  private downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}