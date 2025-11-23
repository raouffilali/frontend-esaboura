import { ICourse } from './../../../../course/interface';
import { IMyCourse } from './../../../interface';
import { MyCourseService } from './../../../../shared/services/my-course.service';
import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../interface';
import { AuthService, SeoService, SystemService } from '../../../../shared/services';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
@Component({
  templateUrl: './list.html'
})
export class ListCourseComponent implements OnInit {
  public currentUser: IUser;
  public currentPage: Number = 1;
  public pageSize: Number = 10;
  public total: Number = 2;
  public categories: any = [];
  public searchFields: any = {
    categoryIds: ''
  };
  public timeout: any;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public course: ICourse;
  public courses: IMyCourse[] = [];
  public count: Number = 0;
  public loading: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private auth: AuthService,
    private myCourseService: MyCourseService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    seoService.update('My Courses');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.categories = this.route.snapshot.data['categories'];
    if (this.auth.isLoggedin()) {
      this.auth.getCurrentUser().then(resp => {
        this.currentUser = resp;
        this.query();
      });
    }
  }

  query() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        userId: this.currentUser._id
      },
      this.searchFields
    );
    this.myCourseService
      .search(params)
      .then(resp => {
        this.count = resp.data.count;
        this.courses = resp.data.items;
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
