// description-form.component.ts - UPDATED: Removed arrow field

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-description-form',
  templateUrl: './description-form.component.html',
  styleUrls: ['./description-form.component.css']
})
export class DescriptionFormComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();
  @Input() showPrevious: boolean = false;
  
  descriptionForm: FormGroup;
  submitting = false;
  submitSuccess = false;
  errorMessage = '';
  submittedData: any = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dataService: DataService
  ) {
    this.descriptionForm = this.fb.group({
      venue: ['', [Validators.required, Validators.minLength(3)]],
      location_address: [''],
      location_maps_url: [''],
      date_and_time: ['', Validators.required],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      message: ['']
    });
  }

  get f() {
    return this.descriptionForm.controls;
  }

  onSubmit() {
    if (this.descriptionForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.submitting = true;
    this.submitSuccess = false;
    this.errorMessage = '';

    const formData = this.descriptionForm.value;

    this.apiService.submitDescription(formData).subscribe({
      next: (response) => {
        console.log('Submission successful:', response);
        this.submitSuccess = true;
        this.submitting = false;
        this.submittedData = response.data;
        
        this.dataService.setDescription(response.data);
      },
      error: (error) => {
        console.error('Submission failed:', error);
        this.errorMessage = error.error?.detail || 'Submission failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  onNext() {
    this.nextStep.emit();
  }

  onPrevious() {
    this.previousStep.emit();
  }

  resetForm() {
    this.descriptionForm.reset();
    this.errorMessage = '';
    this.submitSuccess = false;
    this.submittedData = null;
  }
}