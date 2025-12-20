// music-upload.component.ts - UPDATED with Previous button

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-music-upload',
  templateUrl: './music-upload.component.html',
  styleUrls: ['./music-upload.component.css']
})
export class MusicUploadComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();  // NEW
  @Input() showPrevious: boolean = false;  // NEW
  
  selectedFile: File | null = null;
  uploading = false;
  uploadSuccess = false;
  errorMessage = '';
  uploadedFile: any = null;
  audioUrl: string = '';

  constructor(
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      this.errorMessage = 'Please select a valid audio file';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
    this.audioUrl = URL.createObjectURL(file);
  }

  uploadMusic() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file';
      return;
    }

    this.uploading = true;
    this.uploadSuccess = false;
    this.errorMessage = '';

    this.apiService.uploadBackgroundMusic(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.uploadSuccess = true;
        this.uploading = false;
        this.uploadedFile = response.file;
        
        this.dataService.setMusic(response.file);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.errorMessage = error.error?.detail || 'Upload failed. Please try again.';
        this.uploading = false;
      }
    });
  }

  onNext() {
    this.nextStep.emit();
  }

  onPrevious() {
    this.previousStep.emit();
  }

  clearSelection() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.selectedFile = null;
    this.audioUrl = '';
    this.errorMessage = '';
    this.uploadSuccess = false;
  }

  ngOnDestroy() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }
}