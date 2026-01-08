import { Routes } from '@angular/router';
import { EditorComponent } from './components/editor.component';
import { StatsComponent } from './components/stats.component';
import { LibraryComponent } from './components/library.component';

export const routes: Routes = [
  { path: '', component: LibraryComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'stats', component: StatsComponent },
  { path: '**', redirectTo: '' }
];