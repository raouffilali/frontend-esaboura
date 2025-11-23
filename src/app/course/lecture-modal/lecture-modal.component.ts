import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IMedia } from '../../media/interface';
import { ILecture } from '../interface';
@Component({
  selector: 'app-lecture-modal',
  templateUrl: './lecture-modal.html'
})
export class LectureModalComponent implements OnInit {
  @Input() lecture: ILecture;
  @Input() media: IMedia;
  @Input() rtl: boolean = false;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}
}
