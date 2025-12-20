// photo-upload.component.ts - FIXED: Ensure base64 is stored for PDF

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();
  @Input() showPrevious: boolean = false;
  
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;
  uploadSuccess = false;
  errorMessage = '';
  uploadedFiles: any[] = [];

  constructor(
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  onFileSelect(event: any) {
    const files = event.target.files;
    
    if (files.length !== 2) {
      this.errorMessage = 'Please select exactly 2 photos';
      return;
    }

    this.selectedFiles = Array.from(files);
    this.previewUrls = [];
    this.errorMessage = '';

    // Convert each file to base64 for preview AND storage
    const promises: Promise<string>[] = [];
    
    this.selectedFiles.forEach(file => {
      const promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          resolve(e.target.result);
        };
        reader.onerror = () => reject('Failed to read file');
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    });

    Promise.all(promises).then(base64Array => {
      this.previewUrls = base64Array;
      console.log('✅ Files converted to base64 for preview');
    }).catch(error => {
      console.error('❌ Failed to convert files:', error);
      this.errorMessage = 'Failed to process images';
    });
  }

  uploadPhotos() {
    if (this.selectedFiles.length !== 2) {
      this.errorMessage = 'Please select exactly 2 photos';
      return;
    }

    if (this.previewUrls.length !== 2) {
      this.errorMessage = 'Images are still processing, please wait';
      return;
    }

    this.uploading = true;
    this.uploadSuccess = false;
    this.errorMessage = '';

    this.apiService.uploadPhotos(this.selectedFiles).subscribe({
      next: (response) => {
        console.log('✅ Upload successful:', response);
        this.uploadSuccess = true;
        this.uploading = false;
        this.uploadedFiles = response.files;
        
        // CRITICAL: Store files with their base64 representations
        const filesWithBase64 = response.files.map((file: any, index: number) => ({
          ...file,
          base64: this.previewUrls[index] // Use the preview base64 we already have
        }));
        
        console.log('📸 Storing photos with base64:');
        filesWithBase64.forEach((f: any, i: number) => {
          console.log(`  Photo ${i + 1}:`);
          console.log(`    URL: ${f.url}`);
          console.log(`    Base64: ${f.base64.substring(0, 50)}... (${f.base64.length} chars)`);
        });
        
        this.dataService.setPhotos(filesWithBase64);
        console.log('✅ Photos stored with base64 data for PDF compatibility');
      },
      error: (error) => {
        console.error('❌ Upload failed:', error);
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
    this.selectedFiles = [];
    this.previewUrls = [];
    this.errorMessage = '';
    this.uploadSuccess = false;
  }
}