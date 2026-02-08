// src/app/app.module.ts
// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasdrawComponent } from './canvasdraw/canvasdraw.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasdrawComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule  // REQUIRED for [(ngModel)]
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }