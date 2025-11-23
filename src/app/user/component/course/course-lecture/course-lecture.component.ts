import { LectureService } from './../../../../shared/services/lecture.service';
import { SectionService } from './../../../../shared/services';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ICourse, ILecture, ISection } from '../../../../course/interface';
import { SectionFormComponent, LectureFormComponent } from '../../../component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
declare var jQuery: any;
import { sortBy } from 'lodash';

@Component({
  selector: 'course-lecture',
  templateUrl: './course-lecture.html'
})
export class CourseLetureComponent implements OnInit {
  @Input() course: ICourse;
  @Output() onTabSelect = new EventEmitter();
  @Input() rtl: boolean = false;
  public courseId: string;
  public isSubmitted: boolean = false;
  public sections: ISection[] = [];
  public lectures: ILecture[] = [];
  public loading: boolean = false;
  constructor(
    private toasty: ToastrService,
    private sectionService: SectionService,
    private modalService: NgbModal,
    private lectureService: LectureService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.courseId = this.course._id;
    if (this.courseId) {
      this.loading = true;
      this.sectionService
        .search({ courseId: this.courseId, take: 100, sort: 'ordering', sortType: 'asc' })
        .then(resp => {
          if (resp.data) {
            this.sections = resp.data.items;
            this.loading = false;
            (function ($) {
              $(document).ready(function () {
                $('#accordion').on('hide.bs.collapse show.bs.collapse', e => {
                  $(e.target).prev().find('.btn-collapse i:last-child').toggleClass('fa-minus fa-plus');
                });
              });
            })(jQuery);
          }
        })
        .catch(err => {
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
          this.loading = false;
        });
    }
  }

  onTab(tab: number) {
    this.onTabSelect.emit(tab);
  }

  submitSection(section = {} as ISection) {
    const modalRef = this.modalService.open(SectionFormComponent, { centered: true, backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.section = section;
    modalRef.componentInstance.rtl = this.rtl;
    modalRef.result.then(
      res => {
        if (section._id) {
          this.sectionService
            .update(section._id, Object.assign(res, { courseId: this.courseId }))
            .then(resp => {
              if (resp.data) {
                // section = resp.data;
                const index = this.sections.findIndex(item => item._id === resp.data._id);
                this.sections[index] = resp.data;
                this.sections = sortBy(this.sections, ['ordering']);
                this.toasty.success(this.translate.instant('Updated successfully!'));
              }
            })
            .catch(err => {
              this.toasty.error(
                this.translate.instant(
                  err.data && err.data.data && err.data.data.message
                    ? err.data.data.message
                    : 'Something went wrong, please try again!'
                )
              );
            });
        } else {
          this.sectionService
            .create(Object.assign(res, { courseId: this.courseId }))
            .then(resp => {
              if (resp.data) {
                this.sections.push(Object.assign(resp.data, { lectures: [] }));
                this.sections = sortBy(this.sections, ['ordering']);
                this.toasty.success(this.translate.instant('Created successfully!'));
              }
            })
            .catch(err => {
              this.toasty.error(
                this.translate.instant(
                  err.data && err.data.data && err.data.data.message
                    ? err.data.data.message
                    : 'Something went wrong, please try again!'
                )
              );
            });
        }
      },
      () => {}
    );
  }

  submitLecture(indexSection: number, sectionId: string, courseId: string, lecture = {} as ILecture) {
    const modalRef = this.modalService.open(LectureFormComponent, { centered: true, backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.lecture = lecture;
    modalRef.componentInstance.courseId = courseId;
    modalRef.componentInstance.rtl = this.rtl;
    modalRef.result.then(
      res => {
        if (lecture._id) {
          this.lectureService
            .update(lecture._id, Object.assign(res, { sectionId }))
            .then(resp => {
              if (resp.data) {
                lecture = resp.data;
                this.sections[indexSection].lectures = sortBy(this.sections[indexSection].lectures, ['ordering']);
                this.toasty.success(this.translate.instant('Updated successfully!'));
              }
            })
            .catch(err => {
              this.toasty.error(
                this.translate.instant(
                  err.data && err.data.data && err.data.data.message
                    ? err.data.data.message
                    : 'Something went wrong, please try again!'
                )
              );
            });
        } else {
          this.lectureService
            .create(Object.assign(res, { sectionId }))
            .then(resp => {
              if (resp.data) {
                this.sections[indexSection].lectures.push(resp.data);
                this.sections[indexSection].totalLecture += 1;
                this.sections[indexSection].lectures = sortBy(this.sections[indexSection].lectures, ['ordering']);
                this.toasty.success(this.translate.instant('Created successfully!'));
              }
            })
            .catch(err => {
              this.toasty.error(
                this.translate.instant(
                  err.data && err.data.data && err.data.data.message
                    ? err.data.data.message
                    : 'Something went wrong, please try again!'
                )
              );
            });
        }
      },
      () => {}
    );
  }

  removeSection(item: any, index: number) {
    if (window.confirm('Are you sure to remove this section?')) {
      this.sectionService
        .delete(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant('Item has been deleted!'));
          this.sections.splice(index, 1);
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }
  removeLecture(indexSection: number, item: any, index: number) {
    if (window.confirm('Are you sure to remove this lecture?')) {
      this.lectureService
        .delete(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant('Item has been deleted!'));
          this.sections[indexSection].totalLecture -= 1;
          this.sections[indexSection].lectures.splice(index, 1);
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }
}
