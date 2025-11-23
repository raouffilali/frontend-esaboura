import { SystemService } from './../../shared/services/system.service';
import * as moment from 'moment';
import { PaymentService } from './../../payment/payment.service';
import { WebinarService } from '../webinar.service';
import { CalendarService } from '../../calendar/services/calendar.service';
import { AuthService } from '../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';
import { IMylesson, IUser } from '../../user/interface';
import { IStatsReview } from '../../reviews/interface';
import { FavoriteService } from '../../shared/services';
import { IWebinar, ICoupon } from '../interface';
import { OnInit, Component } from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.html'
})
export class DetailWebinarComponent implements OnInit {
  closeResult: string;
  public targetType: String = 'webinar';
  public webinarParam: string;
  public webinarId: String = '';
  public webinar: IWebinar;
  public slots: IMylesson[];
  public slotChunks: IMylesson[][];
  public isShowSlot: boolean = false;
  public emailRecipient: any = '';
  public salePrice: any;
  public coupon: ICoupon;
  public saleValue: any;
  public usedCoupon: boolean = false;
  public appliedCoupon: boolean = false;
  public couponCode: any = '';
  public canBooking: boolean = false;
  public currentUser: IUser;
  public booked: boolean = false;
  public isLoggedin: boolean = false;
  public slotLeft: number;

  public optionsReview: any = {
    webinarId: ''
  };
  public optionsCoupon: any = {
    webinarId: '',
    tutorId: '',
    targetType: 'webinar',
    couponId: ''
  };
  public type: any;
  public statsReview: IStatsReview = {
    ratingAvg: 0,
    ratingScore: 0,
    totalRating: 0
  };
  public config: any;
  public isHidden: boolean = false;

  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(
    private route: ActivatedRoute,
    private webinarService: WebinarService,
    private calendarService: CalendarService,
    private auth: AuthService,
    private toasty: ToastrService,
    private router: Router,
    private webinarFavoriteService: FavoriteService,
    private translate: TranslateService,
    private appService: AppService,
    private systemService: SystemService,
    private paymentService: PaymentService
  ) {
    this.webinarParam = this.route.snapshot.params.id;
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.findOneWebinar();
    if (this.auth.isLoggedin()) {
      this.isLoggedin = true;
      this.auth.getCurrentUser().then(resp => (this.currentUser = resp));
    }
  }

  findOneWebinar() {
    this.webinarService
      .findOne(this.webinarParam)
      .then(resp => {
        this.webinar = resp.data;
        this.webinarId = resp.data._id;
        this.optionsReview.webinarId = this.webinarId;
        if (this.webinar._id) {
          this.statsReview = {
            ...this.statsReview,
            ...{
              ratingAvg: this.webinar.ratingAvg,
              totalRating: this.webinar.totalRating,
              ratingScore: this.webinar.ratingScore
            }
          };
          this.optionsCoupon.tutorId = this.webinar.tutor._id;
          this.optionsCoupon.webinarId = this.webinar._id;
          if (this.webinar.coupon && this.auth.isLoggedin()) {
            this.optionsCoupon.couponId = this.webinar.coupon._id;
          }
          this.salePrice = this.webinar.price;
          this.slotLeft = this.webinar.maximumStrength - this.webinar.numberParticipants;

          this.findSlots();
          if (this.auth.isLoggedin()) {
            this.webinarService
              .checkBooked(this.webinarId, this.targetType)
              .then((booked: any) => (this.booked = booked.data.booked));
          }
        }
      })
      .catch(err => {
        if (err.data.code == '404') this.router.navigate(['pages/404-not-found']);
        else {
          this.router.navigate(['pages/error', err.data.code]);
        }
      });
  }

  findSlots() {
    this.calendarService
      .search({ webinarId: this.webinarId, take: 100, sort: 'startTime', sortType: 'asc' })
      .then(async resp => {
        this.slots = resp.data.items;
        if (this.slots.length) {
          await this.slots.forEach(slot => {
            this.checkVisableSlot(slot);
          });
          await this.checkCanBooking(this.slots);
          this.slotChunks = _.chunk(this.slots, 2);
          if (this.slotChunks.length > 2) {
            this.isHidden = true;
          }
          this.isShowSlot = true;
        }
      })
      .catch(err => this.toasty.error(this.translate.instant('something went wrong!')));
  }

  enrollWebinar(webinar: any, type: string) {
    if (!this.auth.isLoggedin()) {
      const message =
        type === 'booking' ? 'Please Log in to buy the group class' : 'Please Log in to gift the Group class';
      return this.toasty.error(this.translate.instant(message));
    }
    if (this.webinar.numberParticipants >= this.webinar.maximumStrength) {
      return this.toasty.error(this.translate.instant('No slot available!'));
    }
    if (type === 'gift' && (this.salePrice <= 0 || this.webinar.isFree)) {
      if (!this.emailRecipient) return this.toasty.error(this.translate.instant('Please enter the recipient email!'));
      if (!this.validateEmail(this.emailRecipient)) {
        return this.toasty.error(this.translate.instant('Invalid format email!'));
      }
    }
    if (type === 'booking') {
      this.webinarService
        .checkOverlapWebinar({ userId: this.currentUser._id, webinarId: this.webinar._id })
        .then(resp => {
          if (resp.data.overlapSlots && resp.data.overlapSlots.length) {
            const count = resp.data.overlapSlots.length;
            const noti =
              count === 1
                ? '1 slot is overlap with your booked class. Still book?'
                : count + ' slots are overlap with your booked classes. Still book?';
            if (window.confirm(this.translate.instant(noti))) {
              this.confirmEnroll(webinar, type);
            }
          } else {
            this.confirmEnroll(webinar, type);
          }
        });
    } else this.confirmEnroll(webinar, type);
  }

  confirmEnroll(webinar: any, type: string) {
    const params = Object.assign({
      targetType: this.targetType,
      targetId: webinar._id,
      tutorId: webinar.tutorId,
      type: type,
      emailRecipient: this.emailRecipient
    });
    if (!this.usedCoupon && this.webinar.coupon && this.webinar.coupon.code && this.appliedCoupon) {
      params.couponCode = this.webinar.coupon.code;
    }
    if (this.salePrice <= 0 || webinar.isFree) {
      return this.webinarService
        .enroll(params)
        .then(resp => {
          if (resp.data.status === 'completed') {
            this.toasty.success(this.translate.instant('Have successfully booked free group class'));
            return this.router.navigate(['/users/lessons']);
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
          targetType: 'webinar',
          targetName: webinar.name,
          tutorName: webinar.tutor.name
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
    this.webinar.coupon.code = event.code;
    if (this.appliedCoupon && this.webinar.coupon && this.auth.isLoggedin()) {
      if (this.webinar.coupon.type === 'percent') {
        this.saleValue = this.webinar.coupon.value;
        this.salePrice = this.webinar.price - this.webinar.price * (this.saleValue / 100);
      } else if (this.webinar.coupon.type === 'money') {
        this.saleValue = this.webinar.coupon.value;
        this.salePrice = this.webinar.price - this.saleValue;
      }
    } else {
      this.salePrice = this.webinar.price || 0;
    }
  }

  checkVisableSlot(slot: any) {
    if (moment.utc().add(30, 'minutes').isAfter(moment.utc(slot.startTime))) {
      slot.disable = true;
    } else {
      slot.disable = false;
    }
  }

  checkCanBooking(slots: any) {
    if (slots && slots.length > 0) {
      slots = slots.filter(slot => !slot.disable);
      this.canBooking = slots.length > 0 ? true : false;
    }
  }

  favorite() {
    if (!this.isLoggedin) this.toasty.error(this.translate.instant('Please Log in to add to your favorites'));
    else {
      let params = Object.assign(
        {
          webinarId: this.webinar._id,
          type: 'webinar'
        },
        {}
      );
      this.webinarFavoriteService
        .favorite(params, 'webinar')
        .then(res => {
          this.webinar.isFavorite = true;
          this.toasty.success(this.translate.instant('Added to your favorite webinar list successfully!'));
        })
        .catch(() => this.toasty.error(this.translate.instant('Something went wrong, please try again!')));
    }
  }

  unFavorite() {
    if (!this.isLoggedin) this.toasty.error(this.translate.instant('Please loggin to use this feature!'));
    else {
      this.webinarFavoriteService
        .unFavorite(this.webinar._id, 'webinar')
        .then(res => {
          this.webinar.isFavorite = false;
          this.toasty.success(this.translate.instant('Deleted from your favorite webinar list successfully!'));
        })
        .catch(() => this.toasty.error(this.translate.instant('Something went wrong, please try again!')));
    }
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
}
