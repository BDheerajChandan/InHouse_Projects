// background-upload.component.ts - UPDATED with Previous button

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-background-upload',
  templateUrl: './background-upload.component.html',
  styleUrls: ['./background-upload.component.css']
})
export class BackgroundUploadComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();  // NEW
  @Input() showPrevious: boolean = false;  // NEW
  
  selectedFile: File | null = null;
  previewUrl: string = '';
  uploading = false;
  uploadSuccess = false;
  errorMessage = '';
  uploadedFile: any = null;

  constructor(
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadBackground() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file';
      return;
    }

    this.uploading = true;
    this.uploadSuccess = false;
    this.errorMessage = '';

    this.apiService.uploadBackgroundImage(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.uploadSuccess = true;
        this.uploading = false;
        this.uploadedFile = response.file;
        
        this.dataService.setBackground(response.file);
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

  // NEW: Previous button handler
  onPrevious() {
    this.previousStep.emit();
  }

  clearSelection() {
    this.selectedFile = null;
    this.previewUrl = '';
    this.errorMessage = '';
    this.uploadSuccess = false;
  }
}