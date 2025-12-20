// background-upload.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundUploadComponent } from './background-upload.component';

describe('BackgroundUploadComponent', () => {
  let component: BackgroundUploadComponent;
  let fixture: ComponentFixture<BackgroundUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackgroundUploadComponent]
    });
    fixture = TestBed.createComponent(BackgroundUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
