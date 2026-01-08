import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="flex h-screen w-screen bg-slate-100 overflow-hidden">
      <!-- Left Sidebar (Only visible in Editor/Stats) -->
      @if (showSidebarNav()) {
        <aside class="flex-shrink-0 h-full z-10 transition-all duration-300 ease-in-out overflow-hidden"
               [class.w-64]="isSidebarOpen()"
               [class.w-0]="!isSidebarOpen()">
          <app-sidebar></app-sidebar>
        </aside>
      }

      <!-- Main Content Area -->
      <main class="flex-1 h-full relative flex flex-col">
        <!-- Sidebar Toggle Button (Only if sidebar is available) -->
        @if (showSidebarNav()) {
          <button 
            (click)="toggleSidebar()" 
            class="absolute top-3 left-3 z-30 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm transition-all"
            [title]="isSidebarOpen() ? 'Fechar menu' : 'Abrir menu'">
            @if (isSidebarOpen()) {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
            } @else {
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
               </svg>
            }
          </button>
        }

        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  isSidebarOpen = signal(true);
  showSidebarNav = signal(false);
  
  router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      // Show sidebar only on editor or stats page, hide on library (root)
      this.showSidebarNav.set(e.urlAfterRedirects !== '/');
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
}