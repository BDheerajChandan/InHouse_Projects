// app/src/app.component.ts - UPDATED with Previous/Next navigation

import { Component } from '@angular/core';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Marriage Invitation E-Card Creator by Dheeraj';
  activeTab = 'photos';

  tabs = [
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'background', label: 'Background', icon: '🖼️' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'video', label: 'Video', icon: '🎬' },
    { id: 'description', label: 'Description', icon: '📝' },
    { id: 'preview', label: 'Preview Card', icon: '👁️' }
  ];

  constructor(public dataService: DataService) {}

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToNextTab() {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
    if (currentIndex < this.tabs.length - 1) {
      this.activeTab = this.tabs[currentIndex + 1].id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // NEW: Go to previous tab
  goToPreviousTab() {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
    if (currentIndex > 0) {
      this.activeTab = this.tabs[currentIndex - 1].id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Check if previous button should be shown
  canGoPrevious(): boolean {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
    return currentIndex > 0;
  }

  // Check if next button should be shown
  canGoNext(): boolean {
    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTab);
    return currentIndex < this.tabs.length - 1;
  }
}