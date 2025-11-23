import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { ICourse } from '../interface';
import { CourseService, SeoService, SubjectService, SystemService, TopicService } from '../../shared/services';
import { GradeService } from '../../tutor/services/grade.service';
import { ISubject, ITopic } from '../../user/interface';
import { TranslateService } from '@ngx-translate/core';
import { ageFilter } from '../../utils/utils';
import { Subscription } from 'rxjs';
declare var jQuery: any;
@Component({
  selector: 'app-course-listing',
  templateUrl: './list.html'
})
export class CourseListComponent implements OnInit {
  public page: any = 1;
  public totalCourses: Number = 0;
  public items: ICourse[] = [];
  public item1 = null;
  public currentPage: Number = 1;
  public pageSize: Number = 12;
  public searchFields: any = {
    categoryIds: '',
    gradeIds: '',
    subjectIds: '',
    topicIds: ''
  };
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };

  public queryParams: any;
  public timeout: any;
  public loading: boolean = false;
  public categories: any = [];
  public itemChunks: ICourse[][] = [];
  public dateChange: any = {};
  public config: any;
  public grades: any[] = [];
  public total: any = 0;
  public subjects: ISubject[] = [];
  public topics: ITopic[] = [];
  public ageFilter: any[] = ageFilter;
  public langChange: Subscription;
  public rtl: boolean = false;
  constructor(
    private courseService: CourseService,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private router: Router,
    private gradeService: GradeService,
    private auth: AuthService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    seoService.update('List Courses');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.config = this.route.snapshot.data['appConfig'];
    this.categories = this.route.snapshot.data['categories'];
    this.queryParams = this.route.snapshot.queryParams;
    this.query();
    this.gradeService
      .search({
        take: 100,
        sort: 'ordering',
        sortType: 'asc'
      })
      .then(resp => {
        this.grades = resp.data.items;
      });
  }

  query() {
    this.loading = true;
    const params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`,
        isOpen: true,
        approved: true,
        disabled: false
      },
      this.searchFields,
      this.dateChange
    );
    this.courseService
      .search(params)
      .then(resp => {
        this.totalCourses = resp.data.count;
        this.items = resp.data.items;
        this.itemChunks = _.chunk(this.items, 6);
        this.item1 = this.itemChunks.length && this.itemChunks[0].length ? this.itemChunks[0][0] : null;
        this.loading = false;
        (function ($) {
          $(document).ready(function () {
            const showChar = 150; // How many characters are shown by default
            const ellipsestext = '...';
            const moretext = 'Read More...';
            let content = '';
            $('.more1').each(function () {
              content = $(this).text();
              if (content.length > showChar) {
                const c = content.substr(0, showChar);
                const html =
                  c +
                  '<span class="moreellipses">' +
                  ellipsestext +
                  '&nbsp;</span>' +
                  `</span>&nbsp;&nbsp;` +
                  '</span>';
                $(this).html(html);
              }
            });
          });
        })(jQuery);
      })
      .catch(e => {
        this.loading = false;
        alert('Something went wrong, please try again!');
      });
  }
  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.query();
  }

  sortPrice(evt) {
    const value = evt.target.value;
    if (value) {
      this.sortOption.sortBy = 'price';
      this.sortOption.sortType = value;
    } else {
      this.sortOption = {
        sortBy: 'createdAt',
        sortType: 'desc'
      };
    }
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

  dateChangeEvent(dateChange: any) {
    if (!dateChange) {
      return this.toasty.error(this.translate.instant('Something went wrong, please try again.'));
    }
    this.dateChange = {
      startTime: dateChange.from,
      toTime: dateChange.to
    };
    this.query();
  }
  clickCategory(catId: any) {
    let categoryIds = [];
    categoryIds.push(catId);
    this.searchFields.categoryIds = categoryIds.join(',');
    this.router.navigate(['/categories'], {
      queryParams: { categoryIds: this.searchFields.categoryIds }
    });
  }
  getCategories(course: ICourse): string {
    let categories: string = '';
    if (course.categories.length > 0) {
      course.categories.forEach(cat => {
        categories = categories + cat.name + ', ';
      });
      categories = categories.slice(0, -2);
    }
    return categories;
  }

  gradeChange(event: any) {
    this.page = 1;
    this.query();
  }

  selectCategory() {
    if (this.searchFields.categoryIds) {
      this.querySubjects();
    } else {
      this.searchFields.subjectIds = [];
      this.searchFields.topicIds = [];
      this.subjects = [];
      this.topics = [];
    }
    this.query();
  }

  querySubjects() {
    this.subjectService
      .search({ categoryIds: this.searchFields.categoryIds, take: 1000, isActive: true })
      .then(resp => {
        if (resp.data && resp.data.items && resp.data.items.length > 0) {
          this.subjects = resp.data.items;
        } else {
          this.subjects = [];
        }
      });
  }

  selectSubject() {
    if (this.searchFields.subjectIds) {
      this.queryTopic();
    } else {
      this.searchFields.topicIds = [];
      this.topics = [];
    }
    this.query();
  }

  queryTopic() {
    this.topicService.search({ subjectIds: this.searchFields.subjectIds, take: 1000, isActive: true }).then(resp => {
      if (resp.data && resp.data.items && resp.data.items.length > 0) {
        this.topics = resp.data.items;
      } else {
        this.topics = [];
      }
    });
  }

  filterByAge(event) {
    if (event) {
      this.searchFields = { ...this.searchFields, age: JSON.stringify(event) };
    }
    this.page = 1;
    this.query();
  }
}
