import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (bookService.currentProject(); as project) {
      <div class="max-w-4xl mx-auto p-8 h-full overflow-y-auto">
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-3xl font-serif text-slate-800">Visão Geral do Projeto</h2>
          <a routerLink="/editor" class="text-indigo-600 hover:underline">← Voltar ao Editor</a>
        </div>

        <!-- Meta Data Form -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Título do Livro</label>
              <input 
                type="text" 
                [ngModel]="project.title"
                (ngModelChange)="updateMeta($event, project.author)"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Autor</label>
              <input 
                type="text" 
                [ngModel]="project.author"
                (ngModelChange)="updateMeta(project.title, $event)"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <p class="text-sm text-indigo-600 font-medium uppercase tracking-wide">Total de Palavras</p>
            <p class="text-4xl font-bold text-indigo-900 mt-2">{{ bookService.totalWordCount() }}</p>
          </div>
          <div class="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <p class="text-sm text-emerald-600 font-medium uppercase tracking-wide">Capítulos</p>
            <p class="text-4xl font-bold text-emerald-900 mt-2">{{ project.chapters.length }}</p>
          </div>
          <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <p class="text-sm text-amber-600 font-medium uppercase tracking-wide">Status</p>
            <p class="text-4xl font-bold text-amber-900 mt-2">{{ completedChapters(project) }} / {{ project.chapters.length }}</p>
            <p class="text-xs text-amber-700 mt-1">Capítulos concluídos</p>
          </div>
        </div>

        <!-- Project Notes -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96 flex flex-col">
          <label class="block text-sm font-medium text-slate-700 mb-3">Anotações Gerais & Ideias (Worldbuilding)</label>
          <textarea 
            [ngModel]="project.notes"
            (ngModelChange)="bookService.updateNotes($event)"
            class="flex-1 w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-slate-50"
            placeholder="Escreva aqui suas ideias sobre o mundo, personagens e trama geral..."></textarea>
        </div>
      </div>
    } @else {
      <div class="p-8 text-center text-slate-500">
        Nenhum projeto selecionado. <a routerLink="/" class="text-indigo-600 underline">Voltar para Biblioteca</a>.
      </div>
    }
  `
})
export class StatsComponent {
  bookService = inject(BookService);

  completedChapters(project: any) {
    return project.chapters.filter((c: any) => c.isCompleted).length;
  }

  updateMeta(title: string, author: string) {
    this.bookService.updateProjectMetadata(title, author);
  }
}