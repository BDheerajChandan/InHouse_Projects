// api.service.ts - UPDATED: No arrow field

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = "http://localhost:8000/api"; // or IP address

  constructor(private http: HttpClient) { }

  // Upload two photos
  uploadPhotos(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return this.http.post(`${this.baseUrl}/upload/photos`, formData);
  }

  // Upload background image
  uploadBackgroundImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload/background-image`, formData);
  }

  // Upload background music
  uploadBackgroundMusic(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload/background-music`, formData);
  }

  // Upload background video
  uploadBackgroundVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload/background-video`, formData);
  }

  // Submit description - WITHOUT arrow field
  submitDescription(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('venue', data.venue);
    
    // Location Address
    if (data.location_address) {
      formData.append('location_address', data.location_address);
    }
    
    // Google Maps URL
    if (data.location_maps_url) {
      formData.append('location_maps_url', data.location_maps_url);
    }
    
    formData.append('date_and_time', data.date_and_time);
    formData.append('summary', data.summary);
    
    // Gap box message
    if (data.message) {
      formData.append('message', data.message);
    }
    
    return this.http.post(`${this.baseUrl}/description`, formData);
  }

  // Get all files
  getAllFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }

  // Delete file
  deleteFile(fileType: string, filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/files/${fileType}/${filename}`);
  }
}