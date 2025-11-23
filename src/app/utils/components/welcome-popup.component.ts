import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-welcome-popup',
  template: `<div class="welcome-modal">
    <div class="modal-header">
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="d-flex justify-content-center flex-direction-column welcome-content  align-items-center">
        <h2 translate>Live demo | Online Tutoring Platform | Pinlearn</h2>
        <p translate>Experience the Live demo setup for an online tutoring platform.</p>
        <p translate>
          Explore the features to build a platform like Preply or book a demo with our expert to take you through.
        </p>
        <img src="/assets/images/support.png" alt="" width="100%" />
        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-default btn-disabled" (click)="activeModal.dismiss('Cross click')">
            I'll do this later
          </button>
          <a class="btn btn-default" href="https://calendly.com/pinlearn/15min?month=2021-10" translate
            >Book a free session</a
          >
        </div>
        <div class="mt-3 ml-4">
          <input
            class="form-check-input"
            type="checkbox"
            [(ngModel)]="notShowAgain"
            name="notShowAgain"
            value="{{ false }}"
            (change)="onChange(notShowAgain)"
          />
          <label class="text-secondary" translate for="notShowAgain" translate> Do not show this to me again </label>
        </div>
      </div>
    </div>
  </div>`
})
export class WelcomePopupComponent {
  public notShowAgain: boolean = false;
  constructor(public activeModal: NgbActiveModal) {}

  onChange(value) {
    localStorage.setItem('notShowPopupAgain', value ? 'yes' : 'no');
  }
}
