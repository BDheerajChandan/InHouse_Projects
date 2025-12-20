// data.service.ts - COMPLETE: Stores both URLs and base64 for PDF compatibility

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private cardData: any = {
    photos: [],
    photosBase64: [], // For PDF generation
    background: null,
    backgroundBase64: null,
    music: null,
    video: null,
    videoBase64: null,
    description: null
  };

  constructor() { 
    console.log('📦 DataService initialized');
  }

  // Set Photos - Stores both URL and base64
  setPhotos(files: any[]) {
    this.cardData.photos = files.map(f => f.url);
    this.cardData.photosBase64 = files.map(f => f.base64 || f.url);
    
    console.log('📸 Photos stored in DataService:');
    console.log('  URLs:', this.cardData.photos);
    console.log('  Base64 count:', this.cardData.photosBase64.length);
    this.cardData.photosBase64.forEach((b: string, i: number) => {
      console.log(`  Photo ${i + 1} base64: ${b.substring(0, 50)}... (${b.length} chars)`);
    });
  }

  // Set Background
  setBackground(file: any) {
    this.cardData.background = file.url;
    this.cardData.backgroundBase64 = file.base64 || file.url;
    console.log('🖼️ Background stored:', this.cardData.background);
  }

  // Set Music
  setMusic(file: any) {
    this.cardData.music = file.url;
    console.log('🎵 Music stored:', this.cardData.music);
  }

  // Set Video
  setVideo(file: any) {
    this.cardData.video = file.url;
    this.cardData.videoBase64 = file.base64 || file.url;
    console.log('🎬 Video stored:', this.cardData.video);
  }

  // Set Description
  setDescription(data: any) {
    this.cardData.description = data;
    console.log('📝 Description stored:', data);
  }

  // Get all card data
  getCardData() {
    console.log('📦 Getting card data:', {
      photos: this.cardData.photos?.length || 0,
      photosBase64: this.cardData.photosBase64?.length || 0,
      background: !!this.cardData.background,
      music: !!this.cardData.music,
      video: !!this.cardData.video,
      description: !!this.cardData.description
    });
    return this.cardData;
  }

  // Clear all data
  clearData() {
    this.cardData = {
      photos: [],
      photosBase64: [],
      background: null,
      backgroundBase64: null,
      music: null,
      video: null,
      videoBase64: null,
      description: null
    };
    console.log('🗑️ All data cleared');
  }

  // Check if card is complete
  isCardComplete(): boolean {
    const isComplete = !!(
      this.cardData.photos?.length > 0 &&
      this.cardData.description
    );
    console.log('✅ Card complete:', isComplete);
    return isComplete;
  }
}