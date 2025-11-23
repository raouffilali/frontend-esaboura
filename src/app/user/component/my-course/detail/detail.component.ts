import { QuestionService } from './../../../../shared/services/question.service';
import { ToastrService } from 'ngx-toastr';
import { SectionService } from './../../../../shared/services/section.service';
import { ActivatedRoute } from '@angular/router';
import { ICourse, ILecture, ILectureMeida, ISection } from './../../../../course/interface';
import { IMyCourse } from './../../../interface';
import { MyCourseService } from './../../../../shared/services/my-course.service';
import { OnInit, Component } from '@angular/core';
import { IStatsReview } from '../../../../reviews/interface';
import { TranslateService } from '@ngx-translate/core';
import { MediaModalComponent } from '../../../../media/components/media-modal/media-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SystemService } from '../../../../shared/services';
import { QAModalComponent } from '../mycourse-QA/qa.modal';
declare var jQuery: any;

@Component({
  templateUrl: './detail.html'
})
export class MyCourseDetailComponent implements OnInit {
  public myCourseId: string;
  public courseId: string;
  public course: ICourse;
  public myCourse: IMyCourse;
  public sections: ISection[];
  public completedPercent: number = 0;
  public shownItem: any = {
    title: 'Introduction Video',
    type: 'video',
    url: '',
    description: ''
  };
  public optionsReview: any = {
    type: 'course',
    courseId: ''
  };
  public statsReview: IStatsReview = {
    ratingAvg: 0,
    ratingScore: 0,
    totalRating: 0
  };
  public indexSection: number = -1;
  public indexLecture: number = -1;
  public indexMedia: number = -1;
  public _zoomOut: boolean = false;
  public canNext: boolean = true;
  public canPrev: boolean = true;
  public openLectureId: string;
  public totalMedias: number;
  public rtl: boolean = false;
  public langChange: Subscription;

  public hasQuestion: boolean;

  constructor(
    private route: ActivatedRoute,
    private myCourseService: MyCourseService,
    private sectionService: SectionService,
    private toasty: ToastrService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private systemService: SystemService,
    private questionService: QuestionService
  ) {
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.myCourseId = this.route.snapshot.paramMap.get('id');
    this.myCourseService
      .findOne(this.myCourseId)
      .then(resp => {
        this.myCourse = resp.data;
        this.courseId = resp.data.courseId;
        this.questionService
          .search({ courseId: this.courseId })
          .then(resp => {
            if (resp.data.count > 0) this.hasQuestion = true;
          })
          .catch(err => {
            this.toasty.error(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            );
          });

        this.optionsReview.courseId = resp.data.courseId;
        this.course = resp.data.course;
        this.course.totalLecture = 0;
        this.course.totalLength = 0;
        this.course.totalMedia = 0;

        this.statsReview = {
          ...this.statsReview,
          ...{
            ratingAvg: this.course.ratingAvg,
            totalRating: this.course.totalRating,
            ratingScore: this.course.ratingScore
          }
        };

        this.shownItem.url = this.course.videoIntroduction.fileUrl;
        this.shownItem.description = this.course.description;

        this.sectionService
          .search({ courseId: this.courseId, take: 100, sort: 'ordering', sortType: 'asc' })
          .then(resp => {
            if (resp.data) {
              this.sections = resp.data.items;
              this.sections.map(item => {
                this.calDuration(item);
                this.course.totalLength += item.duration;
                this.course.totalLecture += item.totalLecture;
                this.course.totalMedia += item.totalMedia;
              });
              (function ($) {
                $(document).ready(function () {
                  $('#accordion').on('hide.bs.collapse show.bs.collapse', e => {
                    $(e.target).prev().find('.btn-collapse i:last-child').toggleClass('fa-minus fa-plus');
                  });
                });
              })(jQuery);
              if (this.course.totalMedia > 0)
                this.completedPercent = Math.ceil(
                  (this.myCourse.lectureMediaIdsCompleted.length / this.course.totalMedia) * 100
                );
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

  returnDuration(seconds: number) {
    if (seconds == 0) return '00:00';
    else if (seconds < 10) return '00:0' + seconds;
    var duration: string = '';
    if (seconds < 60) return '00:' + seconds;
    else {
      var hour, minute, second;
      hour = seconds < 3600 ? 0 : Math.floor(seconds / 3600);
      if (hour > 0) {
        if (hour < 10) hour = '0' + hour;
        duration = hour + ':';
      }
      var remainSecond = seconds - parseInt(hour) * 3600;
      minute = Math.floor(remainSecond / 60) < 10 ? '0' + Math.floor(remainSecond / 60) : Math.floor(remainSecond / 60);
      second = seconds - parseInt(hour) * 3600 - minute * 60;
      if (second < 10) second = '0' + second;
      return duration + minute + ':' + second;
    }
  }
  calDuration(section: ISection) {
    let countMedia = 0;
    const lectures = section.lectures || [];
    let duration = 0;
    lectures.forEach(item => {
      let lectureDuration = 0;
      item.medias.forEach(media => {
        countMedia++;
        if (media.mediaType === 'pdf') {
          duration += media.totalLength;
          lectureDuration += media.totalLength;
        } else {
          duration += media.media.duration;
          lectureDuration += media.media.duration;
        }
      });
      item.duration = lectureDuration;
    });
    section.duration = duration;
    section.totalMedia = countMedia;
  }

  returnDurationString(seconds: number) {
    if (seconds == 0) return '0h:0m';
    else {
      var h, m, s: number;
      h = Math.floor(seconds / 3600);
      m = Math.floor((seconds - h * 3600) / 60);
      s = seconds - h * 3600 - m * 60;
      if (h > 0) {
        return h + 'h' + m + 'm';
      } else {
        return m + 'm' + s + 's';
      }
    }
  }

  openLecture(lecture: ILecture, iSection: number, iLecture: number) {
    this.indexLecture = iLecture;
    this.indexSection = iSection;
    if (this.openLectureId !== lecture._id) {
      this.openLectureId = lecture._id;
      this.shownItem.description = `<p>${lecture.description}</p>`;
    } else this.openLectureId = null;
  }

  viewMedia(media: ILectureMeida, iSection: number, iLecture: number, iMedia: number) {
    this.indexLecture = iLecture;
    this.indexSection = iSection;
    this.indexMedia = iMedia;
    this.shownItem.type = media.mediaType;
    this.shownItem.url = media.media.fileUrl;
    this.shownItem.title = media.media.name;
    this.shownItem.description = `<p>${this.sections[this.indexSection].lectures[this.indexLecture].description}</p>`;

    if (this.myCourse) {
      if (!this.myCourse.lectureMediaIdsCompleted.includes(media._id)) {
        this.myCourse.lectureMediaIdsCompleted.push(media._id);
        this.completedPercent = Math.ceil(
          (this.myCourse.lectureMediaIdsCompleted.length / this.course.totalMedia) * 100
        );

        if (this.completedPercent == 100) {
          this.myCourseService
            .complete(this.myCourseId)
            .then(resp => {
              this.toasty.success(
                this.translate.instant('You have completed this course. Check your profile to see the cerificate.')
              );
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

        var params = { lectureMediaId: media._id };
        this.myCourseService.updateProgress(this.myCourseId, params).catch(err => {
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
        });
      }
    }
  }

  videoTrialVideo(section: ISection) {
    const { trialVideo } = section;
    if (trialVideo && trialVideo.fileUrl) {
      const modalRef = this.modalService.open(MediaModalComponent, { centered: true, backdrop: 'static', size: 'lg' });
      modalRef.componentInstance.media = {
        ...trialVideo,
        name: `${section.title} trailer video`
      };
    }
  }

  zoomOut() {
    this._zoomOut = !this._zoomOut;
  }

  next(iSection: number, iLecture: number, iMedia: number) {
    if (this.sections[iSection].lectures[iLecture].medias[iMedia + 1]) {
      this.viewMedia(this.sections[iSection].lectures[iLecture].medias[iMedia + 1], iSection, iLecture, iMedia + 1);
    } else {
      if (this.sections[iSection].lectures[iLecture + 1]) {
        this.viewMedia(this.sections[iSection].lectures[iLecture + 1].medias[0], iSection, iLecture + 1, 0);
      } else {
        if (this.sections[iSection + 1].lectures[0])
          this.viewMedia(this.sections[iSection + 1].lectures[0].medias[0], iSection + 1, 0, 0);
      }
    }
  }

  prev(iSection: number, iLecture: number, iMedia: number) {
    if (iMedia !== 0) {
      this.viewMedia(this.sections[iSection].lectures[iLecture].medias[iMedia - 1], iSection, iLecture, iMedia - 1);
    } else {
      if (this.sections[iSection].lectures[iLecture - 1]) {
        this.viewMedia(
          this.sections[iSection].lectures[iLecture - 1].medias[
            this.sections[iSection].lectures[iLecture - 1].medias.length - 1
          ],
          iSection,
          iLecture - 1,
          this.sections[iSection].lectures[iLecture - 1].medias.length - 1
        );
        // this.viewMedia(
        //   this.sections[iSection].lectures[this.sections[iSection - 1].lectures.length - 1],
        //   iSection - 1,
        //   this.sections[iSection - 1].lectures.length - 1
        // );
      } else {
        if (this.sections[iSection - 1] && this.sections[iSection - 1].lectures) {
          let iNextSection = iSection - 1;
          let nextLecture = this.sections[iNextSection].lectures[this.sections[iNextSection].lectures.length - 1];
          let nextMedia = nextLecture.medias[nextLecture.medias.length - 1];
          this.viewMedia(
            nextMedia,
            iNextSection,
            this.sections[iNextSection].lectures.length - 1,
            nextLecture.medias.length - 1
          );
        }
      }
    }
  }

  viewQA() {
    const modalRef = this.modalService.open(QAModalComponent, { centered: true, backdrop: 'static', size: 'xl' });
    modalRef.componentInstance.courseId = this.courseId;
  }
}
