import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => {
      return import('./module/index/index').then((m) => m.Index);
    },
  },
];
