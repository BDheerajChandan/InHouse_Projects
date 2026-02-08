// app/canvasdraw/canvasdraw.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasdrawComponent } from './canvasdraw.component';

describe('CanvasdrawComponent', () => {
  let component: CanvasdrawComponent;
  let fixture: ComponentFixture<CanvasdrawComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasdrawComponent]
    });
    fixture = TestBed.createComponent(CanvasdrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
