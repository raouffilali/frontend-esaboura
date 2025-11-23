import { SeoService } from './../../../../shared/services/seo.service';
import { CourseService } from './../../../../shared/services/course.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/services';
import { SystemService } from '../../../../shared/services';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../../../interface';
import { ICourse } from '../../../../course/interface';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'course-listing',
  templateUrl: './list.html'
})
export class CourseListingComponent implements OnInit {
  public total: number = 0;
  public items: ICourse[];
  public currentPage: number = 1;
  public pageSize: number = 10;
  public categories: any = [];
  public searchFields: any = {
    categoryIds: ''
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public currentUser: IUser;
  public fromItem: number = 0;
  public toItem: number = 0;
  public timeout: any;
  public loading: boolean = false;
  public config: any;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private translate: TranslateService,
    private courseService: CourseService,
    private toasty: ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private systemService: SystemService
  ) {
    seoService.update('Courses Manager');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.config = this.route.snapshot.data['appConfig'];
    this.categories = this.route.snapshot.data['categories'];
    this.auth.getCurrentUser().then(resp => {
      this.currentUser = resp;
      if (this.currentUser._id) {
        this.query();
      }
    });
  }

  query() {
    this.loading = true;
    let params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        tutorId: this.currentUser._id
      },
      this.searchFields
    );
    this.courseService
      .search(params)
      .then(resp => {
        this.total = resp.data.count;
        this.items = resp.data.items;
        if (this.currentPage === 1) {
          this.fromItem = this.currentPage;
          this.toItem = this.items.length;
        } else if (this.currentPage > 1) {
          this.fromItem =
            this.currentPage * this.pageSize > this.total
              ? (this.currentPage - 1) * this.pageSize
              : this.currentPage * this.pageSize;
          this.toItem = this.fromItem + this.items.length;
        }
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        alert('Something went wrong, please try again!');
      });
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

  showChange(evt) {
    this.pageSize = evt.target.value;
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

  remove(item: any, index: number) {
    if (window.confirm(this.translate.instant('Are you sure to delete this course?'))) {
      this.courseService
        .delete(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant('Course has been deleted!'));
          this.items.splice(index, 1);
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }
}
