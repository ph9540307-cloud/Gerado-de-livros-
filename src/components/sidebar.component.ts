import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../services/book.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-64 h-full flex flex-col bg-slate-50 border-r border-slate-200">
      
      <!-- Back to Library -->
      <div class="p-2 bg-slate-100 border-b border-slate-200">
        <button (click)="goBack()" class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors">
          <span>←</span> Minha Biblioteca
        </button>
      </div>

      <!-- Header -->
      <div class="p-4 border-b border-slate-200 bg-white shadow-sm">
        @if (bookService.currentProject(); as project) {
          <h1 class="text-xl font-bold text-slate-800 font-serif truncate" [title]="project.title">
            {{ project.title }}
          </h1>
        }
        <p class="text-xs text-slate-500 uppercase tracking-wider mt-1">Capítulos</p>
      </div>

      <!-- Chapter List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        @if (bookService.currentProject(); as project) {
          @for (chapter of project.chapters; track chapter.id) {
            <div 
              class="group relative flex flex-col p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md"
              [class]="bookService.currentChapterId() === chapter.id 
                ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100' 
                : 'bg-white border-transparent hover:border-slate-200'"
              (click)="bookService.selectChapter(chapter.id)">
              
              <div class="flex justify-between items-start">
                <span class="font-medium text-sm text-slate-700 truncate w-full pr-6">
                  {{ chapter.title }}
                </span>
                @if (chapter.isCompleted) {
                  <span class="absolute top-3 right-2 text-green-500 text-xs">✓</span>
                }
              </div>
              
              <div class="mt-2 text-xs text-slate-400 line-clamp-2 italic">
                {{ chapter.summary || 'Sem resumo...' }}
              </div>

              <!-- Hover Controls -->
              <div class="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                <button 
                  class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  (click)="$event.stopPropagation(); bookService.reorderChapter(chapter.id, 'up')"
                  title="Mover para cima">
                  ↑
                </button>
                <button 
                  class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  (click)="$event.stopPropagation(); bookService.reorderChapter(chapter.id, 'down')"
                  title="Mover para baixo">
                  ↓
                </button>
                <button 
                  class="p-1 hover:bg-red-50 rounded text-red-300 hover:text-red-500"
                  (click)="$event.stopPropagation(); bookService.deleteChapter(chapter.id)"
                  title="Excluir">
                  ×
                </button>
              </div>
            </div>
          }
        }
        
        <button 
          (click)="bookService.addChapter()"
          class="w-full py-3 mt-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
          <span>+</span> Novo Capítulo
        </button>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 border-t border-slate-200 bg-slate-50">
        <div class="grid grid-cols-2 gap-2">
          <a routerLink="/stats" class="text-center py-2 px-3 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
            Estatísticas
          </a>
          <button (click)="bookService.exportBook()" class="py-2 px-3 bg-slate-800 text-white rounded text-sm hover:bg-slate-900 transition-colors shadow-sm">
            Exportar
          </button>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent {
  bookService = inject(BookService);
  router = inject(Router);

  goBack() {
    this.bookService.closeProject();
    this.router.navigate(['/']);
  }
}