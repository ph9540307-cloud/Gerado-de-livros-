import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, BookProject } from '../services/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 p-8 overflow-y-auto">
      <div class="max-w-6xl mx-auto">
        <header class="flex justify-between items-center mb-10">
          <div>
            <h1 class="text-4xl font-serif font-bold text-slate-800">Minha Biblioteca</h1>
            <p class="text-slate-500 mt-2">Gerencie seus projetos e histórias.</p>
          </div>
          <button 
            (click)="openModal()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2">
            <span>+</span> Novo Livro
          </button>
        </header>

        <!-- Book Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (book of bookService.projects(); track book.id) {
            <div class="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
              
              <!-- Book Content -->
              <div (click)="openBook(book.id)" class="cursor-pointer h-full flex flex-col">
                <div class="flex-1 mb-6">
                  <div class="w-12 h-16 bg-indigo-100 rounded mb-4 flex items-center justify-center text-indigo-600 font-serif text-2xl shadow-inner">
                    {{ book.title.charAt(0).toUpperCase() }}
                  </div>
                  <h3 class="text-xl font-bold text-slate-800 mb-1 font-serif line-clamp-2">{{ book.title }}</h3>
                  <div class="flex justify-between items-start">
                     <p class="text-sm text-slate-500">{{ book.author || 'Sem autor' }}</p>
                     @if(book.genre) {
                       <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider font-bold">{{ book.genre }}</span>
                     }
                  </div>
                </div>
                
                <div class="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <span>{{ book.chapters.length }} capítulos</span>
                  <span>Modificado: {{ book.lastModified | date:'shortDate' }}</span>
                </div>
              </div>

              <!-- Hover Actions -->
              <div class="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- JSON Export Action -->
                <button 
                  (click)="$event.stopPropagation(); exportAsJson(book)"
                  class="text-slate-400 hover:text-indigo-500 p-2 rounded-full hover:bg-indigo-50"
                  title="Exportar como JSON">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </button>
                <!-- Delete Action -->
                <button 
                  (click)="$event.stopPropagation(); deleteBook(book)"
                  class="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
                  title="Excluir livro">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (bookService.projects().length === 0) {
          <div class="text-center py-20">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-xl font-medium text-slate-600">Sua biblioteca está vazia</h3>
            <p class="text-slate-400 mt-2">Crie seu primeiro livro para começar a escrever.</p>
          </div>
        }
      </div>

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
               <h2 class="text-2xl font-bold text-slate-800 font-serif">Novo Livro</h2>
               <button (click)="showCreateModal.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div class="md:col-span-2 space-y-4">
                 <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2">Informações Básicas</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Título do Livro <span class="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        [(ngModel)]="formData.title" 
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ex: A Torre Negra">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Autor</label>
                      <input 
                        type="text" 
                        [(ngModel)]="formData.author" 
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Seu nome">
                    </div>
                 </div>
              </div>

              <!-- Worldbuilding & Style -->
              <div class="md:col-span-2 space-y-4">
                 <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wide border-b border-slate-100 pb-2">Universo & Estilo (Para IA)</h3>
                 
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Gênero</label>
                      <input 
                        type="text" 
                        [(ngModel)]="formData.genre" 
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Fantasia, Sci-Fi, Romance...">
                   </div>
                   <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Tom da História</label>
                      <input 
                        type="text" 
                        [(ngModel)]="formData.tone" 
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Sombrio, Leve, Humorístico, Épico...">
                   </div>
                 </div>

                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Onde se passa? (Cenário)</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.setting" 
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Mundo medieval, São Paulo em 2050, Uma nave espacial...">
                 </div>

                 <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Sistema de Magia ou Tecnologia</label>
                    <textarea 
                      [(ngModel)]="formData.magicSystem" 
                      rows="2"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      placeholder="Magia elemental, Implantes cibernéticos, Realismo total..."></textarea>
                 </div>
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                (click)="showCreateModal.set(false)" 
                class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button 
                (click)="createBook()" 
                [disabled]="!formData.title"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium">
                Criar Projeto
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class LibraryComponent {
  bookService = inject(BookService);
  router = inject(Router);

  showCreateModal = signal(false);
  
  formData = {
    title: '',
    author: '',
    genre: '',
    setting: '',
    magicSystem: '',
    tone: ''
  };

  openModal() {
    this.formData = {
      title: '',
      author: '',
      genre: '',
      setting: '',
      magicSystem: '',
      tone: ''
    };
    this.showCreateModal.set(true);
  }

  openBook(id: string) {
    this.bookService.openProject(id);
    this.router.navigate(['/editor']);
  }

  createBook() {
    if (!this.formData.title) return;
    
    this.bookService.createProject({
      title: this.formData.title,
      author: this.formData.author,
      genre: this.formData.genre,
      setting: this.formData.setting,
      magicSystem: this.formData.magicSystem,
      tone: this.formData.tone
    });

    this.showCreateModal.set(false);
    this.router.navigate(['/editor']);
  }

  deleteBook(book: BookProject) {
    if (confirm(`Tem certeza que deseja excluir "${book.title}"?`)) {
      this.bookService.deleteProject(book.id);
    }
  }

  exportAsJson(book: BookProject) {
    this.bookService.exportProjectAsJson(book);
  }
}