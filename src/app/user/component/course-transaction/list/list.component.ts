import { CourseService } from './../../../../shared/services/course.service';
import { ITransaction } from './../../../../transactions/interface';
import { Component, OnInit } from '@angular/core';
import { AuthService, SeoService, SystemService } from '../../../../shared/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
declare var $: any;
@Component({
  templateUrl: './list.html'
})
export class CourseTransactionListComponent implements OnInit {
  public transactions: ITransaction[] = [];
  public tutorId: string;
  public page = 1;
  public pageSize: Number = 10;
  public total: any = 10;
  public config: any;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public categories: any = [];
  public timeout: any;
  public searchFields: any = {
    categoryIds: '',
    name: ''
  };
  public loading: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(
    private courseService: CourseService,
    private auth: AuthService,
    private toasty: ToastrService,
    private seoService: SeoService,
    public route: ActivatedRoute,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    seoService.update('Course Transactions');
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }
  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.categories = this.route.snapshot.data['categories'];
    this.auth.getCurrentUser().then(resp => {
      this.tutorId = resp._id;
      this.query();
    });
  }

  query() {
    this.loading = true;
    this.courseService
      .getTransactions(
        this.tutorId,
        Object.assign({
          userId: this.tutorId,
          page: this.page,
          take: this.pageSize,
          sort: `${this.sortOption.sortBy}`,
          sortType: `${this.sortOption.sortType}`
        })
      )
      .then(resp => {
        this.transactions = resp.data.items;
        let data = this.transactions.slice();
        if (this.searchFields.categoryIds) {
          this.transactions.length = 0;
          data.forEach(item => {
            if (item.course.categoryIds && item.course.categoryIds.includes(this.searchFields.categoryIds)) {
              this.transactions.push(item);
            }
          });

          if (this.searchFields.name) {
            //this.transactions.length = 0;
            data.forEach(item => {
              if (item.course.name && !item.course.name.toLowerCase().includes(this.searchFields.name.toLowerCase())) {
                this.transactions.splice(this.transactions.indexOf(item), 1);
              }
            });
          }
        } else {
          if (this.searchFields.name) {
            this.transactions.length = 0;
            data.forEach(item => {
              if (item.course.name && item.course.name.toLowerCase().includes(this.searchFields.name.toLowerCase())) {
                this.transactions.push(item);
              }
            });
          }
        }
        this.total = this.transactions.length;
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        return this.toasty.error(this.translate.instant('Something went wrong, please try again'));
      });
  }

  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.query();
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

  doSearch(evt) {
    const searchText = evt.target.value; // this is the search text
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(() => {
      this.searchFields.name = searchText;
      this.query();
    }, 400);
  }
}
