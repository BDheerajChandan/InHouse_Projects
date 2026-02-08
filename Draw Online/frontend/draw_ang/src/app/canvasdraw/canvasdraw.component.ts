// src/app/canvasdraw/canvasdraw.component.ts
// src/app/canvasdraw/canvasdraw.component.ts
// src/app/canvasdraw/canvasdraw.component.ts

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface DrawData {
  type: string;
  prevX?: number;
  prevY?: number;
  x?: number;
  y?: number;
  color?: string;
  lineWidth?: number;
  userName?: string;
}

interface WebSocketMessage {
  type: string;
  color?: string;
  activeUsers?: number;
  maxUsers?: number;
  data?: DrawData[];
  prevX?: number;
  prevY?: number;
  x?: number;
  y?: number;
  lineWidth?: number;
  userName?: string;
  users?: UserInfo[];
  creatorName?: string;
}

interface UserInfo {
  id: string;
  name: string;
  color: string;
}

interface RoomSession {
  roomId: string;
  userName: string;
  timestamp: number;
}

@Component({
  selector: 'app-canvasdraw',
  templateUrl: './canvasdraw.component.html',
  styleUrls: ['./canvasdraw.component.css'],
})
export class CanvasdrawComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ws: WebSocket | null = null;
  private isDrawing = false;
  private lastPos = { x: 0, y: 0 };
  private resizeTimeout: any;

  // Canvas bounds - will auto-adjust to content
  private minCanvasWidth = 800;
  private minCanvasHeight = 600;
  private currentCanvasWidth = 800;
  private currentCanvasHeight = 600;
  private drawingBounds = { minX: 0, minY: 0, maxX: 800, maxY: 600 };

  // Room state
  roomId: string | null = null;
  shareableUrl = '';
  userColor = '#000000';
  userName = '';
  activeUsers = 0;
  maxUsers = 5;
  isConnected = false;
  errorMessage = '';
  showCreateRoomModal = false;
  showConfirmNameModal = false;
  isCreator = false;
  creatorName = '';
  storedUserName = '';

  // Active users list
  activeUsersList: UserInfo[] = [];

  // UI state
  selectedTool: 'pen' | 'eraser' = 'pen';
  lineWidth = 2;
  showCopied = false;

  // Dynamic API URLs
  private apiUrl = '';
  private wsUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = '8000';

    this.apiUrl = `${protocol}//${hostname}:${port}`;
    this.wsUrl = `${wsProtocol}//${hostname}:${port}`;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resizeCanvas();
    }, 250);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const roomId = params['roomId'];
      if (roomId) {
        // Joining existing room
        this.roomId = roomId;
        this.isCreator = false;

        // Check if we have stored session for this room
        const storedSession = this.getStoredSession(roomId);
        if (storedSession) {
          // Found stored session, confirm name
          this.storedUserName = storedSession.userName;
          this.showConfirmNameModal = true;
        } else {
          // New user, ask for name
          this.showCreateRoomModal = true;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.resizeCanvas();

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Store current canvas content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Get container dimensions
    const rect = container.getBoundingClientRect();

    // Set canvas to container size for proper display
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Scale context to maintain drawing coordinates
    const scaleX = rect.width / this.currentCanvasWidth;
    const scaleY = rect.height / this.currentCanvasHeight;
    ctx.scale(scaleX, scaleY);

    // Restore canvas content (will be scaled automatically)
    ctx.putImageData(imageData, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  // Session storage management
  private getStoredSession(roomId: string): RoomSession | null {
    const stored = localStorage.getItem(`draw_session_${roomId}`);
    if (stored) {
      const session: RoomSession = JSON.parse(stored);
      // Check if session is less than 24 hours old
      const now = Date.now();
      if (now - session.timestamp < 24 * 60 * 60 * 1000) {
        return session;
      } else {
        // Session expired, remove it
        localStorage.removeItem(`draw_session_${roomId}`);
      }
    }
    return null;
  }

  private saveSession(roomId: string, userName: string): void {
    const session: RoomSession = {
      roomId,
      userName,
      timestamp: Date.now(),
    };
    localStorage.setItem(`draw_session_${roomId}`, JSON.stringify(session));
  }

  // Modal handlers
  showCreateRoom(): void {
    this.showCreateRoomModal = true;
  }

  confirmStoredName(): void {
    this.userName = this.storedUserName;
    this.showConfirmNameModal = false;
    this.connectToRoom(this.roomId!);
  }

  changeStoredName(): void {
    this.showConfirmNameModal = false;
    this.storedUserName = '';
    this.userName = '';
    this.showCreateRoomModal = true;
  }

  async createRoomWithName(): Promise<void> {
    if (!this.userName.trim()) {
      return;
    }

    this.showCreateRoomModal = false;
    this.errorMessage = '';

    try {
      const response = await fetch(`${this.apiUrl}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_users: this.maxUsers,
          creator_name: this.userName,
        }),
      });
      const data = await response.json();

      this.roomId = data.room_id;
      this.maxUsers = data.max_users;
      this.creatorName = data.creator_name;
      this.isCreator = true;

      const url = `${window.location.origin}/draw/${data.room_id}`;
      this.shareableUrl = url;

      // Save session
      this.saveSession(data.room_id, this.userName);

      this.router.navigate(['/draw', data.room_id]);
      this.connectToRoom(data.room_id);
    } catch (error) {
      this.errorMessage =
        'Failed to create room. Please check your connection.';
      console.error('Error creating room:', error);
    }
  }

  joinRoomWithName(): void {
    if (!this.userName.trim()) {
      return;
    }

    this.showCreateRoomModal = false;

    // Save session
    if (this.roomId) {
      this.saveSession(this.roomId, this.userName);
      this.connectToRoom(this.roomId);
    }
  }

  private connectToRoom(rid: string): void {
    if (!this.userName.trim()) {
      this.showCreateRoomModal = true;
      return;
    }

    const url = `${window.location.origin}/draw/${rid}`;
    this.shareableUrl = url;

    this.ws = new WebSocket(`${this.wsUrl}/ws/${rid}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.errorMessage =
        'Connection error. Please check if backend is running.';
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed', event);
      this.isConnected = false;

      if (event.code === 4003) {
        this.errorMessage = `Room is full. Maximum ${this.maxUsers} users allowed.`;
      } else if (event.code === 4004) {
        this.errorMessage = 'Room not found.';
      }
    };
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleWebSocketMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'room_info':
        // Received room info, now send join request
        this.creatorName = data.creatorName || 'Anonymous';
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'join',
              userName: this.userName,
            }),
          );
        }
        break;

      case 'connected':
        this.isConnected = true;
        this.userColor = data.color || '#000000';
        this.activeUsers = data.activeUsers || 0;
        this.maxUsers = data.maxUsers || 5;
        if (data.users) {
          this.activeUsersList = data.users;
        }
        break;

      case 'init':
        if (data.data) {
          // Calculate drawing bounds
          data.data.forEach((drawData) => {
            if (
              drawData.type === 'draw' &&
              drawData.x !== undefined &&
              drawData.y !== undefined
            ) {
              this.updateDrawingBounds(drawData.x, drawData.y);
            }
          });

          // Adjust canvas size to fit content
          this.adjustCanvasSize();

          // Draw all existing data
          data.data.forEach((drawData) => {
            if (
              drawData.type === 'draw' &&
              drawData.prevX !== undefined &&
              drawData.prevY !== undefined &&
              drawData.x !== undefined &&
              drawData.y !== undefined
            ) {
              this.drawLine(
                drawData.prevX,
                drawData.prevY,
                drawData.x,
                drawData.y,
                drawData.color || '#000000',
                drawData.lineWidth || 2,
              );
            }
          });
        }
        break;

      case 'draw':
        if (
          data.prevX !== undefined &&
          data.prevY !== undefined &&
          data.x !== undefined &&
          data.y !== undefined
        ) {
          // Update bounds
          this.updateDrawingBounds(data.x, data.y);

          this.drawLine(
            data.prevX,
            data.prevY,
            data.x,
            data.y,
            data.color || '#000000',
            data.lineWidth || 2,
          );
        }
        break;

      case 'clear':
        this.clearCanvasLocal();
        this.resetDrawingBounds();
        break;

      case 'user_joined':
      case 'user_left':
        this.activeUsers = data.activeUsers || 0;
        if (data.users) {
          this.activeUsersList = data.users;
        }
        break;

      case 'users_update':
        if (data.users) {
          this.activeUsersList = data.users;
        }
        break;
    }
  }

  private updateDrawingBounds(x: number, y: number): void {
    this.drawingBounds.minX = Math.min(this.drawingBounds.minX, x);
    this.drawingBounds.minY = Math.min(this.drawingBounds.minY, y);
    this.drawingBounds.maxX = Math.max(this.drawingBounds.maxX, x);
    this.drawingBounds.maxY = Math.max(this.drawingBounds.maxY, y);
  }

  private resetDrawingBounds(): void {
    this.drawingBounds = {
      minX: 0,
      minY: 0,
      maxX: this.minCanvasWidth,
      maxY: this.minCanvasHeight,
    };
    this.currentCanvasWidth = this.minCanvasWidth;
    this.currentCanvasHeight = this.minCanvasHeight;
  }

  private adjustCanvasSize(): void {
    const width = Math.max(this.minCanvasWidth, this.drawingBounds.maxX + 100);
    const height = Math.max(
      this.minCanvasHeight,
      this.drawingBounds.maxY + 100,
    );

    if (
      width !== this.currentCanvasWidth ||
      height !== this.currentCanvasHeight
    ) {
      this.currentCanvasWidth = width;
      this.currentCanvasHeight = height;
      this.resizeCanvas();
    }
  }

  private drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number,
  ): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Get current scale
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / this.currentCanvasWidth;
    const scaleY = rect.height / this.currentCanvasHeight;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(x1 * scaleX, y1 * scaleY);
    ctx.lineTo(x2 * scaleX, y2 * scaleY);
    ctx.stroke();

    ctx.restore();
  }

  private getCanvasCoordinates(e: MouseEvent | TouchEvent): {
    x: number;
    y: number;
  } {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }

    // Convert to virtual canvas coordinates
    const scaleX = this.currentCanvasWidth / rect.width;
    const scaleY = this.currentCanvasHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  onMouseDown(e: MouseEvent): void {
    if (!this.isConnected) return;
    e.preventDefault();
    this.isDrawing = true;
    const pos = this.getCanvasCoordinates(e);
    this.lastPos = pos;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.isConnected) return;
    e.preventDefault();

    const pos = this.getCanvasCoordinates(e);
    const color = this.selectedTool === 'eraser' ? '#FFFFFF' : this.userColor;
    const width = this.selectedTool === 'eraser' ? 20 : this.lineWidth;

    // Update bounds
    this.updateDrawingBounds(pos.x, pos.y);

    this.drawLine(this.lastPos.x, this.lastPos.y, pos.x, pos.y, color, width);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'draw',
          prevX: this.lastPos.x,
          prevY: this.lastPos.y,
          x: pos.x,
          y: pos.y,
          color: color,
          lineWidth: width,
          userName: this.userName,
        }),
      );
    }

    this.lastPos = pos;
  }

  onMouseUp(): void {
    this.isDrawing = false;
  }

  onMouseLeave(): void {
    this.isDrawing = false;
  }

  // Touch events for mobile
  onTouchStart(e: TouchEvent): void {
    if (!this.isConnected) return;
    e.preventDefault();
    this.isDrawing = true;
    const pos = this.getCanvasCoordinates(e);
    this.lastPos = pos;
  }

  onTouchMove(e: TouchEvent): void {
    if (!this.isDrawing || !this.isConnected) return;
    e.preventDefault();

    const pos = this.getCanvasCoordinates(e);
    const color = this.selectedTool === 'eraser' ? '#FFFFFF' : this.userColor;
    const width = this.selectedTool === 'eraser' ? 20 : this.lineWidth;

    // Update bounds
    this.updateDrawingBounds(pos.x, pos.y);

    this.drawLine(this.lastPos.x, this.lastPos.y, pos.x, pos.y, color, width);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'draw',
          prevX: this.lastPos.x,
          prevY: this.lastPos.y,
          x: pos.x,
          y: pos.y,
          color: color,
          lineWidth: width,
          userName: this.userName,
        }),
      );
    }

    this.lastPos = pos;
  }

  onTouchEnd(): void {
    this.isDrawing = false;
  }

  private clearCanvasLocal(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  clearCanvas(): void {
    if (!this.isConnected) return;

    this.clearCanvasLocal();
    this.resetDrawingBounds();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'clear' }));
    }
  }

  downloadCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // copyShareableUrl(): void {
  //   if (this.shareableUrl) {
  //     navigator.clipboard.writeText(this.shareableUrl).then(() => {
  //       this.showCopied = true;
  //       setTimeout(() => {
  //         this.showCopied = false;
  //       }, 2000);
  //     });
  //   }
  // }
  copyShareableUrl(): void {
    if (!this.shareableUrl) return;

    const tempInput = document.createElement('input');
    tempInput.value = this.shareableUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices

    try {
      document.execCommand('copy'); // fallback for older browsers
      this.showCopied = true;
      setTimeout(() => (this.showCopied = false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }

    document.body.removeChild(tempInput);
  }

  selectTool(tool: 'pen' | 'eraser'): void {
    this.selectedTool = tool;
  }
}
