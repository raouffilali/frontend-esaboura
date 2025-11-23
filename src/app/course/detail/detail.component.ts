import { IMyCourse } from './../../user/interface';
import { MyCourseService } from './../../shared/services/my-course.service';
import { LectureModalComponent } from './../lecture-modal/lecture-modal.component';
import { FavoriteService } from './../../shared/services/favorite.service';
import { ISection, ICourse, ILecture, ILectureMeida } from './../interface';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { IStatsReview } from '../../reviews/interface';
import { AuthService, LanguageService, SectionService, SystemService } from '../../shared/services';
import { CourseService } from '../../shared/services/course.service';
import { ICoupon } from '../../webinar/interface';
import { IUser } from '../../user/interface';
import { TranslateService } from '@ngx-translate/core';
import { MediaModalComponent } from '../../media/components/media-modal/media-modal.component';
import { AppService } from '../../app.service';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../payment/payment.service';
declare var jQuery: any;
@Component({
  selector: 'course-detail',
  templateUrl: './detail.html'
})
export class CourseDetailComponent implements OnInit {
  public course: ICourse;
  public myCourse: IMyCourse;
  public myCourseId: string;
  public targetType: string = 'course';
  public sections: ISection[] = [];
  public courseParam: string;
  public courseId: string;
  public tutorId: string;
  public enrolledList: any[] = [];
  public isLoggedin: boolean = false;
  public currentUser: IUser;
  public salePrice: any;
  public coupon: ICoupon;
  public saleValue: any;
  public usedCoupon: Boolean = false;
  public appliedCoupon: Boolean = false;
  public couponCode: any = '';
  public videoUrl: string = '';
  public showChar: number = 1000;
  public showMore: boolean = false;
  public indexSection: number;
  public indexLecture: number;
  public indexMedia: number;
  public canView: boolean = false;
  public completedPercent: number = 0;
  public emailRecipient: string;
  public config: any;
  public openLectureId: string;
  public totalMedias: number;
  public optionsReview: any = {
    courseId: '',
    type: 'course'
  };
  public optionsCoupon: any = {
    courseId: '',
    targetType: 'course',
    couponId: ''
  };
  public shownItem: any = {
    title: '',
    type: '',
    url: ''
  };
  public type: any;
  public statsReview: IStatsReview = {
    ratingAvg: 0,
    ratingScore: 0,
    totalRating: 0
  };
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private courseService: CourseService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private auth: AuthService,
    private toasty: ToastrService,
    private router: Router,
    private sectionService: SectionService,
    public languageService: LanguageService,
    private favoriteService: FavoriteService,
    private mycourseService: MyCourseService,
    private systemService: SystemService,
    private translate: TranslateService,
    private appService: AppService,
    private paymentService: PaymentService
  ) {
    this.courseParam = this.route.snapshot.params.id;
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }
  async ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.config = this.route.snapshot.data['appConfig'];
    if (this.auth.isLoggedin()) {
      this.isLoggedin = true;
      await this.auth.getCurrentUser().then(resp => {
        this.currentUser = resp;
      });
    }
    await this.findOneCourse();
  }

  findOneCourse() {
    this.courseService
      .findOne(this.courseParam)
      .then(resp => {
        this.course = resp.data;
        this.courseId = resp.data._id;
        this.optionsReview.courseId = this.courseId;
        this.salePrice = this.course.price;
        this.tutorId = resp.data.tutorId;
        if (this.currentUser && this.currentUser._id === this.tutorId) this.canView = true;
        this.course.totalLecture = 0;
        this.course.totalLength = 0;
        this.course.totalMedia = 0;
        this.videoUrl = resp.data.videoIntroduction.fileUrl;
        if (this.course._id) {
          this.statsReview = {
            ...this.statsReview,
            ...{
              ratingAvg: this.course.ratingAvg,
              totalRating: this.course.totalRating,
              ratingScore: this.course.ratingScore
            }
          };

          this.courseService.getEnrolledList(this.courseId).then(resp => {
            resp.data.items.forEach(item => {
              if (item.type === 'booking') this.enrolledList.push(item);
            });
            this.enrolledList = this.enrolledList.slice(0, 9);
          });

          this.optionsCoupon.courseId = this.courseId;
          if (this.course.coupon && this.auth.isLoggedin()) {
            this.optionsCoupon.couponId = this.course.coupon._id;
          }
          if (this.auth.isLoggedin()) {
            if (this.course.booked) {
              this.canView = true;
              //find myCourse
              var params = {
                userId: this.currentUser._id
              };
              this.mycourseService.search(params).then(resp => {
                if (resp.data.items.length) {
                  resp.data.items.forEach(item => {
                    if (item.courseId === this.courseId) {
                      this.myCourse = item;
                      this.myCourseId = item.id;
                      if (this.course.totalMedia > 0)
                        this.completedPercent = Math.ceil(
                          (this.myCourse.lectureMediaIdsCompleted.length / this.course.totalMedia) * 100
                        );
                    }
                  });
                }
              });
            }
          }
          (function ($) {
            $(document).ready(function () {
              $('#accordion').on('hide.bs.collapse show.bs.collapse', e => {
                $(e.target).prev().find('.btn-collapse i:last-child').toggleClass('fa-minus fa-plus');
              });
              $('ul.term-list').each(function () {
                if ($(this).find('li').length > 3) {
                  $('li', this).eq(1).nextAll().hide().addClass('toggleable');
                  $(this).append('<div class="more read_more">Read More...</div>');
                }
                $(this).on('click', '.more', toggleShow);
              });

              function toggleShow() {
                var opened = $(this).hasClass('less');
                $(this)
                  .text(opened ? 'Read More...' : 'Read Less...')
                  .toggleClass('less read_less', !opened);
                $(this).siblings('li.toggleable').slideToggle();
              }
            });
          })(jQuery);
        }

        if (this.course && this.course.description && this.course.description.length > this.showChar) {
          this.showMore = true;
        }

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
            }
          })
          .catch(err => {
            if (this.course.booked) {
              this.toasty.success('You have purchased this course already');
            } else {
              this.toasty.error(
                this.translate.instant(
                  err.data && err.data.data && err.data.data.message
                    ? err.data.data.message
                    : 'Something went wrong, please try again!'
                )
              );
            }
          });
      })
      .catch(err => {
        if (err.data.code == '404') this.router.navigate(['pages/404-not-found']);
        else {
          this.router.navigate(['pages/error', err.data.code]);
        }
      });
  }

  enrollCourse(course: any, type: string) {
    if (!this.auth.isLoggedin()) {
      return this.toasty.error(this.translate.instant('Please Log in to buy the course!'));
    }
    if (type === 'gift' && (this.salePrice <= 0 || this.course.isFree)) {
      if (!this.emailRecipient) return this.toasty.error(this.translate.instant('Please enter the recipient email!'));
      if (!this.validateEmail(this.emailRecipient)) {
        return this.toasty.error(this.translate.instant('Invalid format email!'));
      }
    }

    const params = Object.assign({
      targetType: this.targetType,
      targetId: course._id,
      tutorId: course.tutorId,
      type: type,
      emailRecipient: this.emailRecipient
    });
    if (!this.usedCoupon && this.course.coupon && this.course.coupon.code && this.appliedCoupon) {
      params.couponCode = this.course.coupon.code;
    }
    if (this.salePrice <= 0 || course.isFree) {
      return this.courseService
        .enroll(params)
        .then(resp => {
          if (resp.data.status === 'completed') {
            this.toasty.success(this.translate.instant('Have successfully booked free courses'));
            return this.router.navigate(['/users/my-courses']);
          } else {
            return this.router.navigate(['/payments/cancel']);
          }
        })
        .catch(e => {
          this.toasty.error(
            this.translate.instant(
              (e.data && e.data.data && e.data.data.message) ||
                e.data.message ||
                'Something went wrong, please try again!'
            )
          );
          this.router.navigate(['/payments/cancel']);
        });
    } else {
      localStorage.setItem('paymentParams', JSON.stringify(params));
      return this.router.navigate(['/payments/pay'], {
        queryParams: {
          type: type,
          targetType: 'course',
          targetName: this.course.name,
          tutorName: this.course.tutor.name
        },
        state: params
      });
    }
  }

  checkUsedCoupon(used: boolean) {
    this.usedCoupon = used;
  }

  applyCoupon(event: { appliedCoupon: boolean; code: string }) {
    this.appliedCoupon = event.appliedCoupon;
    this.course.coupon.code = event.code;
    if (this.appliedCoupon && this.course.coupon && this.auth.isLoggedin()) {
      if (this.course.coupon.type === 'percent') {
        this.saleValue = this.course.coupon.value;
        this.salePrice = this.course.price - this.course.price * (this.saleValue / 100);
      } else if (this.course.coupon.type === 'money') {
        this.saleValue = this.course.coupon.value;
        this.salePrice = this.course.price - this.saleValue;
      }
    } else {
      this.salePrice = this.course.price || 0;
    }
  }

  returnDuration(seconds: number) {
    if (seconds == 0) return '00:00';
    else if (seconds < 10) return '00:0' + seconds;
    let duration: string = '';
    if (seconds < 60) return '00:' + seconds;
    else {
      let hour, minute, second;
      hour = seconds < 3600 ? 0 : Math.floor(seconds / 3600);
      if (hour > 0) {
        if (hour < 10) hour = '0' + hour;
        duration = hour + ':';
      }
      const remainSecond = seconds - parseInt(hour) * 3600;
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
    let h, m, s: number;
    h = Math.floor(seconds / 3600);
    m = Math.floor((seconds - h * 3600) / 60);
    s = seconds - h * 3600 - m * 60;
    if (h > 0) {
      return h + 'h' + m + 'm';
    } else {
      return m + 'm' + s + 's';
    }
  }

  favorite() {
    if (!this.isLoggedin) this.toasty.error(this.translate.instant('Please Log in to add to your favorites'));
    else {
      let params = Object.assign(
        {
          courseId: this.course._id,
          type: 'course'
        },
        {}
      );
      this.favoriteService
        .favorite(params, 'course')
        .then(res => {
          this.course.isFavorite = true;
          this.toasty.success(this.translate.instant('Added to your favorite course list successfully!'));
        })
        .catch(() => this.toasty.error(this.translate.instant('Something went wrong, please try again!')));
    }
  }

  unFavorite() {
    if (!this.isLoggedin) this.toasty.error(this.translate.instant(''));
    else {
      this.favoriteService
        .unFavorite(this.course._id, 'course')
        .then(res => {
          this.course.isFavorite = false;
          this.toasty.success(this.translate.instant('Deleted from your favorite course list successfully!'));
        })
        .catch(() => this.toasty.error(this.translate.instant('Something went wrong, please try again!')));
    }
  }
  viewMedia(media: ILectureMeida, iSection: number, iLecture: number, iMedia: number) {
    this.indexLecture = iLecture;
    this.indexSection = iSection;
    this.indexMedia = iMedia;
    const modalRef = this.modalService.open(LectureModalComponent, { centered: true, backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.lecture = media;
    modalRef.componentInstance.rtl = this.rtl;

    if (this.myCourse) {
      if (!this.myCourse.lectureMediaIdsCompleted.includes(media._id)) {
        this.myCourse.lectureMediaIdsCompleted.push(media._id);
        this.completedPercent = Math.ceil(
          (this.myCourse.lectureMediaIdsCompleted.length / this.course.totalMedia) * 100
        );

        if (this.completedPercent == 100) {
          this.mycourseService
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
        this.mycourseService.updateProgress(this.myCourseId, params).catch(err => {
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

  openLecture(lecture: ILecture, iSection: number, iLecture: number) {
    this.indexLecture = iLecture;
    this.indexSection = iSection;
    if (this.openLectureId !== lecture._id) {
      this.openLectureId = lecture._id;
    } else this.openLectureId = null;
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

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
}
