import { IMylesson, IUser } from '../../interface';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppointmentService } from '../../../shared/services';
import { IWebinar } from '../../../webinar/interface';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import Cookies from 'js-cookie';
import { AppService } from '../../../app.service';
@Component({
  selector: 'modal-appointment',
  templateUrl: './modal.html'
})
export class ModalAppointment implements OnInit {
  @Input() appointments: IMylesson[] = [];
  @Input() currentUser: IUser;
  @Input() webinar: IWebinar;
  @Input() type: string;
  @Input() transactionId: string;
  @Input() rtl: boolean = false;
  public currentPage: number = 1;
  public pageSize: number = 5;
  public total: number;
  public searchFields: any = {};
  public sortOption = {
    sortBy: 'startTime',
    sortType: 'asc'
  };
  public loading: boolean = false;
  public joining: boolean = false;
  public starting: boolean = false;
  public studentId: string;

  constructor(
    public activeModal: NgbActiveModal,
    private appointmentService: AppointmentService,
    private toasty: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private appService: AppService
  ) {}

  ngOnInit() {
    if (this.webinar) {
      if (this.type === 'student') {
        this.queryAppointmentStudent();
      } else {
        this.queryAppointmentTutor();
      }
    }
  }

  async queryAppointmentStudent() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        userId: this.currentUser._id,
        targetType: 'webinar',
        webinarId: this.webinar._id,
        transactionId: this.transactionId
      },
      this.searchFields
    );
    await this.appointmentService
      .search(params)
      .then(resp => {
        this.appointments = resp.data.items;
        this.total = resp.data.count;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        alert(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  async queryAppointmentTutor() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        tutorId: this.currentUser._id,
        targetType: 'webinar',
        webinarId: this.webinar._id,
        userId: this.studentId || '',
        transactionId: this.transactionId
      },
      this.searchFields
    );
    await this.appointmentService
      .search(params)
      .then(resp => {
        this.appointments = resp.data.items;
        this.total = resp.data.count;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        alert(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  pageChange() {
    if (this.type === 'student') {
      this.queryAppointmentStudent();
    } else {
      this.queryAppointmentTutor();
    }
  }

  joinMeeting(appointmentId: string) {
    if (!this.joining) {
      this.joining = true;
      this.appointmentService
        .joinMeeting(appointmentId)
        .then(resp => {
          this.joining = false;
          if (resp.data && resp.data.platform === 'zoomus' && resp.data['zoomus'].signature) {
            localStorage.setItem('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']));
            Cookies.set('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']), {
              domain: this.appService.settings.zoomDomain
            });
            window.location.href = `${this.appService.settings.zoomSiteUrl}?appointmentId=${appointmentId}`;
          } else if (resp.data && resp.data.platform === 'lessonspace' && resp.data['lessonspace'].url) {
            localStorage.setItem('lessonSpaceUrl', resp.data['lessonspace'].url);
            this.router.navigate(['/users/lesson-space'], {
              queryParams: {
                appointmentId
              }
            });
          }
          this.close();
        })
        .catch(err => {
          this.joining = false;
          return this.toasty.error(
            this.translate.instant(
              (err.data && err.data.data && err.data.data.message) ||
                err.data.message ||
                'Something went wrong, please try again!'
            )
          );
        });
    } else {
      this.toasty.success(this.translate.instant('Connecting...'));
    }
  }

  startMeeting(appointmentId: string) {
    if (!this.starting) {
      this.starting = true;
      this.appointmentService
        .startMeeting(appointmentId)
        .then(resp => {
          this.starting = false;
          if (resp.data && resp.data.platform === 'zoomus' && resp.data['zoomus'].signature) {
            localStorage.setItem('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']));
            Cookies.set('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']), {
              domain: this.appService.settings.zoomDomain
            });
            window.location.href = `${this.appService.settings.zoomSiteUrl}?appointmentId=${appointmentId}`;
          } else if (resp.data && resp.data.platform === 'lessonspace' && resp.data['lessonspace'].url) {
            localStorage.setItem('lessonSpaceUrl', resp.data['lessonspace'].url);
            this.router.navigate(['/users/lesson-space'], {
              queryParams: {
                appointmentId
              }
            });
          }
          this.close();
        })
        .catch(err => {
          this.starting = false;
          return this.toasty.error(
            this.translate.instant(
              (err.data && err.data.data && err.data.data.message) ||
                err.data.message ||
                'Something went wrong, please try again!'
            )
          );
        });
    } else {
      this.toasty.success(this.translate.instant('Connecting...'));
    }
  }

  close() {
    this.activeModal.close(true);
  }
}
