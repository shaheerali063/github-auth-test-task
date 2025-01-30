import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent }, // Home (OAuth page)
  { path: '**', redirectTo: '' } // Catch-all (redirect to home)
];
