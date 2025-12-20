// description-form.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionFormComponent } from './description-form.component';

describe('DescriptionFormComponent', () => {
  let component: DescriptionFormComponent;
  let fixture: ComponentFixture<DescriptionFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DescriptionFormComponent]
    });
    fixture = TestBed.createComponent(DescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
