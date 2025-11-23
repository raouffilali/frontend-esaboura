import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { AppointmentService, SystemService } from '../../../../shared/services';
import { AuthService } from '../../../../shared/services';
import { IMylesson } from '../../../interface';
import { IFilterReview, IStatsReview } from '../../../../reviews/interface';
import { TranslateService } from '@ngx-translate/core';
import Cookies from 'js-cookie';
import { AppService } from '../../../../app.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'detail-appointment',
  templateUrl: './detail.html',
  styleUrls: ['../../../../reviews/components/star-rating/star-rating.scss']
})
export class ScheduleDetailComponent implements OnInit {
  public userType: string;
  public appointment: IMylesson = {};
  private aId: any;
  public isShowRefundButton: Boolean = false;
  public reason: string = '';
  public submitted: Boolean = false;
  public hovered: number;
  public hasReview: boolean;
  public reviewOptions: IFilterReview = {
    appointmentId: '',
    type: 'subject',
    rateTo: '',
    rateBy: ''
  };
  public statsReview: IStatsReview = {
    ratingAvg: 0,
    ratingScore: 0,
    totalRating: 0
  };
  public newReview: any;
  public isUpdateReview: boolean = false;

  public documentOptions: any;
  public documents: any = [];
  public documentIds: string[] = [];
  public filesSelected: any = [];

  public config: any;

  public starting: boolean = false;
  public canReview: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private translate: TranslateService,
    private appService: AppService,
    private systemService: SystemService,
    private router: Router
  ) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.aId = this.route.snapshot.paramMap.get('id');
    this.authService.getCurrentUser().then(resp => {
      this.userType = resp.type;
    });
    this.appointmentService
      .findOne(this.aId)
      .then(resp => {
        this.appointment = resp.data;
        if (this.appointment.status === 'completed' || this.appointment.status === 'progressing') this.canReview = true;
        if (this.appointment.documents && this.appointment.documents.length) {
          this.documents = resp.data.documents;
          this.documentIds = resp.data.documents.map(d => d._id);
        }
        this.statsReview = {
          ...this.statsReview,
          ...{
            ratingAvg: this.appointment.user.ratingAvg,
            totalRating: this.appointment.user.totalRating,
            ratingScore: this.appointment.user.ratingScore
          }
        };

        this.documentOptions = {
          url: this.appService.settings.apiBaseUrl + `/appointments/${this.aId}/upload-document`,
          fileFieldName: 'file',
          onFinish: resp => {
            this.documentIds.push(resp.data._id);
            this.documents.push(resp.data);
            this.toasty.success(this.translate.instant('Uploaded successfully'));
          },
          onFileSelect: resp => (this.filesSelected = resp),
          id: 'file-upload'
        };
        if (this.appointment.paid && this.appointment.meetingEnd) {
          this.isShowRefundButton = true;
        }
        this.reviewOptions.appointmentId = this.appointment._id;
        this.reviewOptions.rateTo = this.appointment.user._id;
        this.reviewOptions.rateBy = this.appointment.tutor._id;
      })
      .catch(e => this.toasty.error(this.translate.instant('Something went wrong, please try again')));
  }

  cancel() {
    this.submitted = true;
    if (this.reason === '') {
      return this.toasty.error(this.translate.instant('Please enter the reason for cancellation'));
    }
    this.appointmentService
      .tutorCancel(this.appointment._id, { reason: this.reason })
      .then(resp => {
        this.appointment.status = 'canceled';
        this.appointment.cancelReason = this.reason;
        this.toasty.success(this.translate.instant('Canceled successfully!'));
      })
      .catch(err =>
        this.toasty.error(
          this.translate.instant(
            (err.data && err.data.data && err.data.data.message) ||
              err.data.message ||
              'Something went wrong, please try again!'
          )
        )
      );
  }

  removeMedia(i: any) {
    this.appointmentService
      .removeDocument(this.aId, this.documentIds[i])
      .then(resp => {
        this.documentIds.splice(i, 1);
        this.documents.splice(i, 1);
        this.toasty.success(this.translate.instant('Removed successfully'));
      })
      .catch(e => {
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  updateDocs() {
    const params = {
      documentIds: this.documentIds
    };
    this.appointmentService
      .updateDocument(this.aId, params)
      .then(resp => {
        this.toasty.success(this.translate.instant('Update successfully'));
      })
      .catch(e => {
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  startMeeting() {
    if (!this.starting) {
      this.starting = true;
      this.appointmentService
        .startMeeting(this.appointment._id)
        .then(resp => {
          this.starting = false;
          if (resp.data && resp.data.platform === 'zoomus' && resp.data['zoomus'].signature) {
            Cookies.set('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']), {
              domain: this.appService.settings.zoomDomain
            });
            localStorage.setItem('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']));
            window.location.href = `${this.appService.settings.zoomSiteUrl}?appointmentId=${this.appointment._id}`;
          } else if (resp.data && resp.data.platform === 'lessonspace' && resp.data['lessonspace'].url) {
            localStorage.setItem('lessonSpaceUrl', resp.data['lessonspace'].url);
            this.router.navigate(['/users/lesson-space'], {
              queryParams: {
                appointmentId: this.appointment._id
              }
            });
          }
        })
        .catch(err => {
          this.starting = false;
          this.toasty.error(
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
}
