import { CourseService } from './../../../../shared/services/course.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ICourse } from '../../../../course/interface';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

@Component({
  selector: 'course-goal',
  templateUrl: './course-goal.html'
})
export class CourseGoalComponent implements OnInit {
  @Input() course: ICourse;
  @Input() rtl: boolean = false;
  @Output() onTabSelect = new EventEmitter();
  public courseId: string;
  public courseGoal: any = {
    goalCourse: '',
    whyJoinCourse: '',
    needToJoinCourse: ''
  };
  public isSubmitted: boolean = false;
  public index: number = 0;
  constructor(
    private translate: TranslateService,
    private toasty: ToastrService,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.courseId = this.course._id;
  }

  addItem(type: string) {
    this.course[type].push(this.courseGoal[type]);
    this.courseGoal[type] = '';
    this.submit();
  }

  submit() {
    this.isSubmitted = true;
    if (this.course._id) {
      this.courseService
        .update(
          this.courseId,
          _.pick(this.course, [
            'name',
            'price',
            'description',
            'alias',
            'categoryIds',
            'introductionVideoId',
            'mainImageId',
            'isFree',
            'goalCourse',
            'whyJoinCourse',
            'needToJoinCourse'
          ])
        )
        .then(resp => {
          this.toasty.success(this.translate.instant('Updated successfuly!'));
          //this.router.navigate(['/users/courses']);
        })
        .catch(err => {
          this.toasty.error(
            this.translate.instant((err.data.data && err.data.data.message) || err.data.message || err.data.email)
          );
        });
    }
  }

  removeItem(type: string, i: number) {
    if (window.confirm(this.translate.instant('Are you sure to delete this?'))) {
      this.course[type].splice(i, 1);
      this.submit();
    }
  }

  onTab(tab: number) {
    this.onTabSelect.emit(tab);
  }
}
