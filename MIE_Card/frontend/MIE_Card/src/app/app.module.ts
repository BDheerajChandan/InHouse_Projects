// app/src/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PhotoUploadComponent } from './components/photo-upload/photo-upload.component';
import { BackgroundUploadComponent } from './components/background-upload/background-upload.component';
import { MusicUploadComponent } from './components/music-upload/music-upload.component';
import { DescriptionFormComponent } from './components/description-form/description-form.component';
import { VideoUploadComponent } from './components/video-upload/video-upload.component';
import { CardPreviewComponent } from './components/card-preview/card-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    PhotoUploadComponent,
    BackgroundUploadComponent,
    MusicUploadComponent,
    DescriptionFormComponent,
    VideoUploadComponent,
    CardPreviewComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }