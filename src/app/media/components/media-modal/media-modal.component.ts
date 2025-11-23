import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IMedia } from '../../interface';
@Component({
  selector: 'app-media-modal',
  templateUrl: './media-modal.html'
})
export class MediaModalComponent implements OnInit {
  @Input() media: IMedia;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}
}
