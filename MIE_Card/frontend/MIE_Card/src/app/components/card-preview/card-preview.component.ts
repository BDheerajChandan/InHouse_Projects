// card-preview.component.ts - FIXED: Images visible in PDF

import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { DataService } from '../../services/data.service';

declare const html2pdf: any;

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.css']
})
export class CardPreviewComponent implements OnInit {
  @ViewChild('cardContainer', { static: false }) cardContainer!: ElementRef;
  @Output() previousStep = new EventEmitter<void>();
  @Input() showPrevious: boolean = false;
  
  cardData: any = {};
  hasData = false;
  isGeneratingPDF = false;
  pdfProgress = 0;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadCardData();
    this.autoPlayMusic();
  }

  loadCardData() {
    this.cardData = this.dataService.getCardData();
    this.hasData = this.checkIfDataExists();
    
    console.log('📦 Card Data Loaded:');
    console.log('  Photos URLs:', this.cardData.photos);
    console.log('  Photos Base64 available:', this.cardData.photosBase64?.length > 0);
  }

  checkIfDataExists(): boolean {
    return !!(
      this.cardData.photos?.length > 0 ||
      this.cardData.background ||
      this.cardData.music ||
      this.cardData.video ||
      this.cardData.description
    );
  }

  autoPlayMusic() {
    if (this.cardData.music) {
      setTimeout(() => {
        const audio = document.getElementById('cardAudio') as HTMLAudioElement;
        if (audio) {
          audio.play().catch(err => {
            console.log('Autoplay blocked by browser:', err);
          });
        }
      }, 1000);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  shareCard() {
    if (navigator.share) {
      navigator.share({
        title: 'Wedding Invitation',
        text: this.cardData.description?.summary || 'You are invited!',
      }).catch(err => console.log('Error sharing:', err));
    } else {
      alert('Share feature not supported on this browser');
    }
  }

  onPrevious() {
    this.previousStep.emit();
  }

  // Convert URL to base64 with proper CORS handling
  private urlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // If already base64, return it
      if (url.startsWith('data:image')) {
        resolve(url);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas context not available');
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.95);
          console.log(`✅ Converted image to base64: ${base64.substring(0, 50)}...`);
          resolve(base64);
        } catch (error) {
          console.error('❌ Canvas conversion failed:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ Image load failed:', url, error);
        reject('Failed to load image');
      };
      
      // Add timestamp to avoid caching issues
      img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    });
  }

  // Convert video to thumbnail
  private videoToBase64(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      video.onloadeddata = () => {
        video.currentTime = 1;
      };
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas context not available');
            return;
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.95);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = () => reject('Failed to load video');
    });
  }

  // Pre-load all images as base64 BEFORE cloning
  private async preloadAllImagesAsBase64(): Promise<Map<string, string>> {
    const base64Map = new Map<string, string>();
    
    console.log('🔄 Pre-loading images as base64...');
    
    // Load photo images
    if (this.cardData.photosBase64 && this.cardData.photosBase64.length > 0) {
      for (let i = 0; i < this.cardData.photosBase64.length; i++) {
        const photoSrc = this.cardData.photosBase64[i];
        console.log(`Loading photo ${i + 1}: ${photoSrc.substring(0, 50)}...`);
        
        try {
          const base64 = await this.urlToBase64(photoSrc);
          base64Map.set(`photo-${i}`, base64);
          console.log(`✅ Photo ${i + 1} loaded as base64`);
        } catch (error) {
          console.error(`❌ Failed to load photo ${i + 1}:`, error);
        }
      }
    }
    
    // Load background image
    if (this.cardData.background) {
      const bgUrl = 'http://127.0.0.1:8000' + this.cardData.background;
      console.log(`Loading background: ${bgUrl}`);
      
      try {
        const base64 = await this.urlToBase64(bgUrl);
        base64Map.set('background', base64);
        console.log('✅ Background loaded as base64');
      } catch (error) {
        console.error('❌ Failed to load background:', error);
      }
    }
    
    // Load video thumbnail
    if (this.cardData.video) {
      const videoUrl = 'http://127.0.0.1:8000' + this.cardData.video;
      console.log(`Loading video thumbnail: ${videoUrl}`);
      
      try {
        const base64 = await this.videoToBase64(videoUrl);
        base64Map.set('video-bg', base64);
        console.log('✅ Video thumbnail loaded as base64');
      } catch (error) {
        console.error('❌ Failed to load video:', error);
      }
    }
    
    console.log(`✅ Pre-loaded ${base64Map.size} images as base64`);
    return base64Map;
  }

  // Replace images in cloned element with pre-loaded base64
  private replaceImagesWithBase64(clonedElement: HTMLElement, base64Map: Map<string, string>): void {
    console.log('🔄 Replacing images with base64 in cloned element...');
    
    // Replace photo images
    const photoImgs = clonedElement.querySelectorAll('.photo-img');
    photoImgs.forEach((img: Element, index: number) => {
      const base64 = base64Map.get(`photo-${index}`);
      if (base64) {
        (img as HTMLImageElement).src = base64;
        img.setAttribute('src', base64);
        console.log(`✅ Replaced photo ${index + 1} with base64`);
      }
    });
    
    // Replace background image
    const bgElement = clonedElement.querySelector('.description-bg-full') as HTMLElement;
    if (bgElement) {
      const bgBase64 = base64Map.get('background');
      if (bgBase64) {
        bgElement.style.backgroundImage = `url(${bgBase64})`;
        console.log('✅ Replaced background with base64');
      }
    }
  }

  // Add background to PDF
  private addBackgroundToPDF(clonedElement: HTMLElement, base64Map: Map<string, string>): void {
    const bgWrapper = document.createElement('div');
    bgWrapper.style.position = 'absolute';
    bgWrapper.style.top = '0';
    bgWrapper.style.left = '0';
    bgWrapper.style.width = '100%';
    bgWrapper.style.height = '100%';
    bgWrapper.style.zIndex = '-1';
    bgWrapper.style.overflow = 'hidden';

    const videoBg = base64Map.get('video-bg');
    const imageBg = base64Map.get('background');

    if (videoBg) {
      const bgImage = document.createElement('img');
      bgImage.src = videoBg;
      bgImage.style.width = '100%';
      bgImage.style.height = '100%';
      bgImage.style.objectFit = 'cover';
      bgImage.style.opacity = '0.3';
      bgWrapper.appendChild(bgImage);
      console.log('✅ Added video thumbnail as background');
    } else if (imageBg) {
      const bgImage = document.createElement('img');
      bgImage.src = imageBg;
      bgImage.style.width = '100%';
      bgImage.style.height = '100%';
      bgImage.style.objectFit = 'cover';
      bgImage.style.opacity = '0.3';
      bgWrapper.appendChild(bgImage);
      console.log('✅ Added background image');
    } else {
      bgWrapper.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      console.log('✅ Using gradient background');
    }

    clonedElement.style.position = 'relative';
    clonedElement.insertBefore(bgWrapper, clonedElement.firstChild);
  }

  // Apply table-like styles for PDF layout
  private applyTableStylesForPDF(clonedElement: HTMLElement): void {
    const layoutContainer = clonedElement.querySelector('.new-layout') as HTMLElement;
    if (!layoutContainer) {
      console.log('⚠️ No .new-layout found');
      return;
    }

    console.log('🔄 Applying table-like styles for PDF...');

    layoutContainer.style.display = 'flex';
    layoutContainer.style.flexDirection = 'row';
    layoutContainer.style.flexWrap = 'nowrap';
    layoutContainer.style.justifyContent = 'center';
    layoutContainer.style.alignItems = 'center';
    layoutContainer.style.gap = '30px';
    layoutContainer.style.margin = '40px auto';
    layoutContainer.style.maxWidth = '800px';

    const children = layoutContainer.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      
      if (child.classList.contains('photo-item')) {
        child.style.flex = '0 0 auto';
        const img = child.querySelector('.photo-img') as HTMLImageElement;
        if (img) {
          img.style.width = '200px';
          img.style.height = '260px';
          img.style.minWidth = '200px';
          img.style.minHeight = '260px';
          img.style.maxWidth = '200px';
          img.style.maxHeight = '260px';
          img.style.objectFit = 'cover';
          img.style.display = 'block';
        }
      } else if (child.classList.contains('gap-box')) {
        child.style.flex = '0 0 auto';
        child.style.width = '220px';
        child.style.minWidth = '220px';
        child.style.maxWidth = '220px';
      }
    }

    console.log('✅ Applied PDF styles');
  }

  // MAIN PDF GENERATION METHOD
  async downloadAsPDF() {
    try {
      this.isGeneratingPDF = true;
      this.pdfProgress = 5;

      // Pause audio
      const audio = document.getElementById('cardAudio') as HTMLAudioElement;
      let wasPlaying = false;
      if (audio && !audio.paused) {
        wasPlaying = true;
        audio.pause();
      }

      this.pdfProgress = 10;

      // Get card content
      const cardContainer = this.cardContainer.nativeElement;
      const cardContent = cardContainer.querySelector('.card-content') as HTMLElement;
      
      if (!cardContent) {
        throw new Error('Card content not found');
      }

      console.log('✅ Capturing .card-content element');
      
      this.pdfProgress = 15;

      // STEP 1: Pre-load ALL images as base64 FIRST
      const base64Map = await this.preloadAllImagesAsBase64();
      
      this.pdfProgress = 40;

      // STEP 2: Clone the element
      const clonedElement = cardContent.cloneNode(true) as HTMLElement;
      
      // Remove audio and video elements
      const audioElement = clonedElement.querySelector('#cardAudio');
      if (audioElement) audioElement.remove();
      
      const videoElement = clonedElement.querySelector('.background-video');
      if (videoElement) videoElement.remove();

      this.pdfProgress = 50;

      // STEP 3: Apply table styles
      this.applyTableStylesForPDF(clonedElement);
      
      this.pdfProgress = 60;

      // STEP 4: Replace all images with pre-loaded base64
      this.replaceImagesWithBase64(clonedElement, base64Map);
      
      this.pdfProgress = 70;

      // STEP 5: Add background
      this.addBackgroundToPDF(clonedElement, base64Map);
      
      this.pdfProgress = 75;

      // Apply styling to cloned element
      clonedElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      clonedElement.style.padding = '60px 40px';
      clonedElement.style.color = 'white';
      clonedElement.style.textAlign = 'center';
      clonedElement.style.minHeight = '800px';
      clonedElement.style.position = 'relative';

      // Capture link position for clickable PDF
      const linkElement = cardContent.querySelector('.clickable-pdf-link') as HTMLElement;
      let linkBounds = null;
      
      if (linkElement && this.cardData.description?.location_maps_url) {
        const rect = linkElement.getBoundingClientRect();
        const containerRect = cardContent.getBoundingClientRect();
        
        linkBounds = {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height
        };
      }

      this.pdfProgress = 80;

      // PDF Configuration
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `wedding-invitation-${Date.now()}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true,
          backgroundColor: null,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy']
        }
      };

      console.log('🔄 Generating PDF...');
      this.pdfProgress = 85;

      // Generate PDF
      const worker = html2pdf().set(opt).from(clonedElement);
      const pdfInstance = await worker.toPdf().get('pdf');

      this.pdfProgress = 92;

      // Add clickable link
      if (this.cardData.description?.location_maps_url && linkBounds) {
        const pdf = pdfInstance;
        const mapsUrl = this.cardData.description.location_maps_url;
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const linkX = (linkBounds.left * pageWidth / cardContent.offsetWidth) + 10;
        const linkY = (linkBounds.top * pageHeight / cardContent.offsetHeight) + 10;
        const linkW = (linkBounds.width * pageWidth / cardContent.offsetWidth);
        const linkH = (linkBounds.height * pageHeight / cardContent.offsetHeight);

        pdf.link(linkX, linkY, linkW, linkH, { url: mapsUrl });
        console.log('✅ Clickable link added');
      }

      this.pdfProgress = 97;

      // Save PDF
      await worker.save();

      this.pdfProgress = 100;
      console.log('✅ PDF generated successfully with images!');

      // Resume audio
      setTimeout(() => {
        this.isGeneratingPDF = false;
        this.pdfProgress = 0;
        
        if (wasPlaying && audio) {
          audio.play().catch(() => {});
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
      this.isGeneratingPDF = false;
      this.pdfProgress = 0;
      
      const audio = document.getElementById('cardAudio') as HTMLAudioElement;
      if (audio) audio.play().catch(() => {});
    }
  }

  ngOnDestroy() {
    const audio = document.getElementById('cardAudio') as HTMLAudioElement;
    if (audio) audio.pause();
  }
}