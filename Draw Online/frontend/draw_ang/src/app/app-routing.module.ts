// app/app-routing.module.ts

// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanvasdrawComponent } from './canvasdraw/canvasdraw.component';

const routes: Routes = [
  { path: '', component: CanvasdrawComponent },
  { path: 'draw/:roomId', component: CanvasdrawComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }