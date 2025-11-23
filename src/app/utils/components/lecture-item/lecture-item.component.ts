import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { ILecture } from '../../../course/interface';

@Component({
  selector: 'app-lecture-item',
  templateUrl: './lecture-item.html'
})
export class LectureItemComponent implements OnInit {
  @Input() lecture: ILecture = {};
  @Input() isEdit: boolean = false;
  @Input() paid: boolean = false;

  constructor(private toasty: ToastrService) {}

  ngOnInit() {}

  edit() {}
}
