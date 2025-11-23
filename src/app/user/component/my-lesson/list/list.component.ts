import { Component, OnInit } from '@angular/core';
import { AuthService, AppointmentService, SeoService, SystemService } from '../../../../shared/services';
import { IMylesson, IUser } from '../../../interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TransactionService } from '../../../../transactions/services/transaction.service';
import { ITransaction } from '../../../../transactions/interface';
import { ModalAppointment } from '../../modal-appointment/modal-appointment.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IWebinar } from '../../../../webinar/interface';
import { TranslateService } from '@ngx-translate/core';
import Cookies from 'js-cookie';
import { AppService } from '../../../../app.service';
declare var $: any;
@Component({
  selector: 'app-list-lesson',
  templateUrl: './list.html'
})
export class ListLessonComponent implements OnInit {
  public currentUser: IUser;
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  public total: Number = 2;
  public searchFields: any = {};
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public appointments: IMylesson[] = [];
  public count: Number = 0;
  public loading: boolean = false;
  public config: any;
  public timeout: any;
  public joining: boolean = false;
  public tab: string = 'webinar';
  public filterTransactionOptions: any = {
    currentPage: 1,
    pageSize: 10,
    sortOption: {
      sortBy: 'createdAt',
      sortType: 'desc'
    },
    total: 0,
    loading: false,
    searchFields: {}
  };
  public transactions: ITransaction[] = [];

  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private toasty: ToastrService,
    private transactionService: TransactionService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private router: Router,
    private appService: AppService,
    private systemService: SystemService
  ) {
    seoService.update('My Lessons');
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    if (this.auth.isLoggedin()) {
      this.auth.getCurrentUser().then(resp => {
        this.currentUser = resp;
        this.queryTransactionWebinar();
      });
    }
  }

  async query() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        userId: this.currentUser._id,
        targetType: this.tab,
        paid: true
      },
      this.searchFields
    );
    await this.appointmentService
      .search(params)
      .then(resp => {
        this.count = resp.data.count;
        this.appointments = resp.data.items;
        this.total = resp.data.count;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        alert(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  onSort(evt) {
    this.sortOption = evt;
    this.query();
  }

  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    if (this.tab === 'subject') {
      this.query();
    } else {
      this.queryTransactionWebinar();
    }
  }

  doSearch(evt) {
    const searchText = evt.target.value; // this is the search text
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(() => {
      this.searchFields.description = searchText;
      this.query();
    }, 400);
  }

  joinMeeting(appointmentId: string) {
    if (!this.joining) {
      this.joining = true;
      this.appointmentService
        .joinMeeting(appointmentId)
        .then(resp => {
          this.joining = false;
          if (resp.data && resp.data.platform === 'zoomus' && resp.data['zoomus'].signature) {
            Cookies.set('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']), {
              domain: this.appService.settings.zoomDomain
            });
            localStorage.setItem('zoomMeetingInfo', JSON.stringify(resp.data['zoomus']));
            window.location.href = `${this.appService.settings.zoomSiteUrl}?appointmentId=${appointmentId}`;
          } else if (resp.data && resp.data.platform === 'lessonspace' && resp.data['lessonspace'].url) {
            localStorage.setItem('lessonSpaceUrl', resp.data['lessonspace'].url);
            this.router.navigate(['/users/lesson-space'], {
              queryParams: {
                appointmentId
              }
            });
          }
        })
        .catch(err => {
          this.joining = false;
          return this.toasty.error(
            this.translate.instant(
              (err.data && err.data.data && err.data.data.message) ||
                err.data.message ||
                'Something went wrong, please try again! ana'
            )
          );
        });
    } else {
      this.toasty.success(this.translate.instant('Connecting...'));
    }
  }

  onTabSelect(tab: string) {
    this.tab = tab;
    if (this.tab === 'subject') {
      this.query();
    } else this.queryTransactionWebinar();
  }

  queryTransactionWebinar() {
    if (this.auth.isLoggedin()) {
      this.auth.getCurrentUser().then(resp => {
        this.currentUser = resp;
        const params = Object.assign({
          page: this.filterTransactionOptions.currentPage,
          take: this.filterTransactionOptions.pageSize,
          sort: `${this.filterTransactionOptions.sortOption.sortBy}`,
          sortType: `${this.filterTransactionOptions.sortOption.sortType}`,
          userId: this.currentUser._id,
          targetType: 'webinar',
          paid: true
        });
        this.loading = true;
        this.transactionService
          .search(params)
          .then(resp => {
            this.transactions = resp.data.items;
            this.filterTransactionOptions.total = resp.data.count;
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            return this.toasty.error(this.translate.instant('Something went wrong, please try again'));
          });
      });
    }
  }

  openModalAppointment(transaction: ITransaction) {
    if (transaction.webinar) {
      const modalRef = this.modalService.open(ModalAppointment, {
        centered: true,
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.currentUser = this.currentUser;
      modalRef.componentInstance.webinar = transaction.webinar;
      modalRef.componentInstance.type = 'student';
      modalRef.componentInstance.transactionId = transaction._id;
      modalRef.componentInstance.rtl = this.rtl;
      modalRef.result.then(
        res => {},
        () => {}
      );
    }
  }
}
