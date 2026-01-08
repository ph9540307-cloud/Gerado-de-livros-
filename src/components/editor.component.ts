import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Chapter } from '../services/book.service';
import { GeminiService } from '../services/gemini.service';
import { SpeechService } from '../services/speech.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (chapter(); as currentChapter) {
      <div class="flex h-full bg-slate-100 relative overflow-hidden">
        
        <!-- Center: Writing Area -->
        <div class="flex-1 h-full overflow-y-auto relative flex flex-col items-center p-4 md:p-8"> 
          
          <div class="w-full max-w-[800px] flex flex-col gap-6 pb-32">
            
            <!-- Header Area -->
            <div class="flex items-center gap-4 border-b-2 border-transparent hover:border-slate-300 transition-colors">
              <input 
                type="text" 
                [ngModel]="currentChapter.title"
                (ngModelChange)="updateChapter(currentChapter.id, {title: $event})"
                class="flex-1 text-2xl md:text-3xl font-bold text-slate-800 bg-transparent outline-none py-2 font-serif placeholder-slate-300 w-full"
                placeholder="Título do Capítulo">
              
              <!-- Download Button -->
              <button 
                (click)="bookService.downloadChapter(currentChapter)"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Baixar Capítulo (.txt)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-4.5-4.5m4.5 4.5l4.5-4.5M12 12.75v-9" />
                </svg>
              </button>

              <!-- Audio Controls -->
               <div class="flex items-center gap-1 bg-white rounded-full shadow-sm border border-slate-200 p-1">
                 @if (!speechService.isSpeaking()) {
                   <button 
                    (click)="playChapter(currentChapter.content)"
                    class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Ouvir Capítulo">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                       <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                     </svg>
                   </button>
                 } @else {
                   <!-- Speed Control -->
                   <button 
                     (click)="speechService.cycleRate()"
                     class="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors w-12"
                     title="Velocidade de Leitura">
                     {{ speechService.rate() }}x
                   </button>

                   <div class="w-px h-4 bg-slate-200 mx-1"></div>
                   
                   <!-- Previous -->
                   <button 
                     (click)="speechService.skip('prev')"
                     class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                     title="Voltar">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                       <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                     </svg>
                   </button>

                   <!-- Play/Pause -->
                   <button 
                    (click)="speechService.togglePause()"
                    class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    [title]="speechService.isPaused() ? 'Retomar' : 'Pausar'">
                     @if (speechService.isPaused()) {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                          <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                        </svg>
                     } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                          <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
                        </svg>
                     }
                   </button>

                   <!-- Next -->
                   <button 
                     (click)="speechService.skip('next')"
                     class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                     title="Avançar">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                       <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                     </svg>
                   </button>

                   <button 
                    (click)="speechService.cancel()"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-1"
                    title="Parar Leitura">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                       <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
                     </svg>
                   </button>
                   
                   <!-- Audio Wave Animation -->
                   <div class="flex items-center gap-0.5 px-2 h-4" *ngIf="!speechService.isPaused()">
                     <div class="w-1 bg-indigo-400 rounded-full animate-wave h-2"></div>
                     <div class="w-1 bg-indigo-400 rounded-full animate-wave h-3 animation-delay-100"></div>
                     <div class="w-1 bg-indigo-400 rounded-full animate-wave h-4 animation-delay-200"></div>
                     <div class="w-1 bg-indigo-400 rounded-full animate-wave h-2 animation-delay-100"></div>
                   </div>
                 }
               </div>
            </div>

            <!-- Planning & AI Tools Section (Inline) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
                 [class.ring-2]="isLoading()"
                 [class.ring-indigo-100]="isLoading()">
              
              <!-- Toggle Header -->
              <div (click)="toggleTools()" class="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors select-none">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" [class.bg-indigo-500]="currentChapter.summary" [class.bg-slate-300]="!currentChapter.summary"></span>
                  Planejamento & IA
                </span>
                <button class="text-slate-400 transform transition-transform duration-200" [class.rotate-180]="showTools()">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <!-- Tools Body -->
              @if (showTools()) {
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  
                  <!-- Summary Input -->
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-slate-500">Resumo / Semente do Capítulo</label>
                    <textarea 
                      [ngModel]="currentChapter.summary"
                      (ngModelChange)="updateChapter(currentChapter.id, {summary: $event})"
                      class="w-full h-32 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                      placeholder="O que deve acontecer neste capítulo?"></textarea>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col gap-4 justify-end">
                    
                    @if (!showRegenerateInput()) {
                      <!-- Word Count Slider -->
                      <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div class="flex justify-between items-center mb-2">
                          <label class="text-xs font-bold text-slate-500 uppercase">Tamanho do Texto</label>
                          <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            ~{{ targetWordCount() }} palavras
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="300" 
                          max="3000" 
                          step="100" 
                          [ngModel]="targetWordCount()"
                          (ngModelChange)="targetWordCount.set($event)"
                          class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700">
                      </div>

                      @if (aiError()) {
                         <div class="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{{ aiError() }}</div>
                      }

                      <!-- Main Generation Button -->
                      <button 
                        (click)="generateDraft()"
                        [disabled]="isLoading() || !currentChapter.summary"
                        class="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                        @if(isLoading() && generationType() === 'draft') {
                          <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                          <span>Escrevendo...</span>
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                          </svg>
                          <span>Gerar Capítulo</span>
                        }
                      </button>

                      <!-- Quick Tools -->
                      <div class="grid grid-cols-2 gap-2">
                         <button (click)="getSuggestion('continuation')" [disabled]="isLoading()" class="btn-tool">Continuar Cena</button>
                         <button (click)="getSuggestion('dialogue')" [disabled]="isLoading()" class="btn-tool">Criar Diálogo</button>
                      </div>

                      @if (lastGenerationType()) {
                         <button (click)="openRegeneration()" [disabled]="isLoading()" class="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1 text-center">
                           Não gostou? Gerar outra versão
                         </button>
                      }
                    } @else {
                      <!-- Regeneration Feedback Mode -->
                       <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col gap-3 animate-fade-in">
                         <div class="flex justify-between items-center">
                           <span class="text-xs font-bold text-indigo-800 uppercase">O que você quer mudar?</span>
                           <button (click)="showRegenerateInput.set(false)" class="text-slate-400 hover:text-slate-600">✕</button>
                         </div>
                         <textarea 
                           [ngModel]="feedbackText()"
                           (ngModelChange)="feedbackText.set($event)"
                           class="w-full h-20 p-2 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                           placeholder="Ex: 'Faça mais sombrio', 'Adicione mais diálogo', 'Remova a parte do combate'...">
                         </textarea>
                         <button 
                           (click)="confirmRegenerate()"
                           [disabled]="isLoading()"
                           class="w-full py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                            @if(isLoading()) {
                              <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            }
                           Regenerar com ajustes
                         </button>
                       </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Writing Surface -->
            <div class="bg-white shadow-lg min-h-[60vh] md:min-h-[80vh] px-6 py-8 md:px-12 md:py-16 rounded-sm relative border-t-4 border-indigo-600">
              <textarea
                [ngModel]="currentChapter.content"
                (ngModelChange)="updateChapter(currentChapter.id, {content: $event})"
                class="w-full h-full min-h-[50vh] resize-none outline-none font-serif text-base md:text-lg leading-relaxed text-slate-800 placeholder-slate-300"
                placeholder="Comece a escrever aqui..."></textarea>
            </div>

            <!-- Footer Stats -->
            <div class="flex justify-between items-center text-sm text-slate-500 px-2 md:px-4">
              <span>{{ bookService.chapterWordCount() }} palavras</span>
              <label class="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                <input 
                  type="checkbox" 
                  [ngModel]="currentChapter.isCompleted"
                  (ngModelChange)="updateChapter(currentChapter.id, {isCompleted: $event})"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                <span>Concluído</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    } @else {
       <div class="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-4 text-center">
        <p class="mb-4">Nenhum livro selecionado.</p>
        <a routerLink="/" class="text-indigo-600 hover:underline">Voltar para Biblioteca</a>
      </div>
    }
  `,
  styles: [`
    .btn-tool {
      @apply py-2 px-3 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    .animate-wave {
      animation: wave 1s infinite ease-in-out;
    }
    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes wave {
      0%, 100% { transform: scaleY(0.5); }
      50% { transform: scaleY(1); }
    }
  `]
})
export class EditorComponent implements OnDestroy {
  bookService = inject(BookService);
  geminiService = inject(GeminiService);
  speechService = inject(SpeechService);

  chapter = this.bookService.currentChapter;
  project = this.bookService.currentProject;
  
  showTools = signal(true); 
  targetWordCount = signal(1000); 
  
  // UI State for Regeneration
  showRegenerateInput = signal(false);
  feedbackText = signal('');

  // AI State
  isLoading = signal(false);
  generationType = signal<string | null>(null);
  lastGenerationType = signal<string | null>(null);
  aiError = signal<string | null>(null);

  ngOnDestroy() {
    // Ensure speech stops when navigating away
    this.speechService.cancel();
  }

  playChapter(content: string) {
    this.speechService.speak(content);
  }

  toggleTools() {
    this.showTools.update(v => !v);
  }

  updateChapter(id: string, changes: Partial<Chapter>) {
    this.bookService.updateChapter(id, changes);
  }

  // Helper to extract AI context from the project
  private getAIContext() {
    const p = this.project();
    if (!p) return undefined;
    return {
      genre: p.genre,
      setting: p.setting,
      magicSystem: p.magicSystem,
      tone: p.tone
    };
  }

  async generateDraft(feedback?: string, replace: boolean = false) {
    const ch = this.chapter();
    if (!ch || !ch.summary) return;
    
    this.startLoading('draft');
    this.lastGenerationType.set('draft');

    try {
      const result = await this.geminiService.generateChapterDraft(
        ch.title, 
        ch.summary, 
        this.getAIContext(),
        this.targetWordCount(),
        feedback
      );
      if (!result) throw new Error('A IA não retornou texto.');
      
      if (replace) {
        this.updateChapter(ch.id, { content: result });
      } else {
        this.appendContent(result);
      }
      
      // Reset regen UI
      this.showRegenerateInput.set(false);
      this.feedbackText.set('');

    } catch (err) {
      this.handleError(err);
    } finally {
      this.stopLoading();
    }
  }

  async getSuggestion(type: string, feedback?: string) {
    const ch = this.chapter();
    if (!ch) return;

    if (!ch.summary) {
      this.aiError.set('Escreva o resumo primeiro.');
      return;
    }

    this.startLoading(type);
    this.lastGenerationType.set(type);

    try {
      const result = await this.geminiService.generateSuggestion(
        ch.summary, 
        ch.content, 
        type, 
        this.getAIContext(),
        feedback
      );
      if (!result) throw new Error('A IA não retornou sugestões.');
      
      this.appendContent(result);
      
      // Reset regen UI
      this.showRegenerateInput.set(false);
      this.feedbackText.set('');

    } catch (err) {
      this.handleError(err);
    } finally {
      this.stopLoading();
    }
  }

  openRegeneration() {
    this.showRegenerateInput.set(true);
    this.feedbackText.set('');
  }

  async confirmRegenerate() {
    const type = this.lastGenerationType();
    const feedback = this.feedbackText();

    if (type === 'draft') {
      // Pass replace = true for Draft regeneration
      await this.generateDraft(feedback, true);
    } else if (type) {
      // For suggestions (short text), we might want to append, 
      // but if the user says "regenerate", they likely disliked the last suggestion.
      // However, suggestions are appended. We can't easily undo just the last part safely without keeping history.
      // For now, suggestions will just append another version.
      await this.getSuggestion(type, feedback);
    }
  }

  private appendContent(text: string) {
    const ch = this.chapter();
    if (!ch) return;
    
    const separator = ch.content.trim().length > 0 ? '\n\n' : '';
    this.updateChapter(ch.id, {
      content: ch.content + separator + text
    });
  }

  private startLoading(type: string) {
    this.isLoading.set(true);
    this.generationType.set(type);
    this.aiError.set(null);
  }

  private stopLoading() {
    this.isLoading.set(false);
    this.generationType.set(null);
  }

  private handleError(err: any) {
    console.error(err);
    this.aiError.set('Erro na geração. Verifique sua conexão/API Key.');
  }
}