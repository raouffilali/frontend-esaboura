import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  CategoryService,
  CourseService,
  SubjectService,
  SystemService,
  TopicService
} from '../../../../shared/services';
import { ICourse } from '../../../../course/interface';
import { ICategory } from '../../../../categories/interface';
import * as _ from 'lodash';
import { GradeService } from '../../../../tutor/services/grade.service';
import { TranslateService } from '@ngx-translate/core';
import { ageFilter } from '../../../../utils/utils';
import { AppService } from '../../../../app.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-course-update',
  templateUrl: '../form.html'
})
export class CourseUpdateComponent implements OnInit {
  public maxFileSize: any;
  public tab: number = 1;
  public isFree: boolean = false;
  public courseId: any;
  public course: ICourse = {};
  public isSubmitted: Boolean = false;
  public loading: Boolean = false;
  public categories: ICategory[] = [];
  public mainImageOptions: any;
  public videoOptions: any;
  public mainImageUrl: String = '';
  public videoUrl: String = '';
  public imageSelected: any[] = [];
  public videoSelected: any[] = [];
  public uploadingVideo: boolean = false;
  public uploadingImage: boolean = false;
  public checkMobileBrowser: boolean = false;
  public config: any;
  public grades: any[] = [];

  public quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['code-block'],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        [{ direction: 'rtl' }], // text direction

        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ font: [] }],
        [{ align: [] }],

        ['clean']
        // ['image']
      ]
    },
    keyboard: {
      bindings: {
        enter: {
          key: 13,
          handler: (range, context) => {
            return true;
          }
        }
      }
    }
  };
  public rtl: boolean = false;
  public langChange: Subscription;

  public myCategories: any[] = [];
  public mySubjects: any[] = [];
  public myTopics: any[] = [];
  public filterMyCategory: any = {
    currentPage: 1,
    pageSize: 100,
    sortOption: {
      sortBy: 'ordering',
      sortType: 'asc'
    },
    total: 0,
    loading: false
  };
  public filterMySubject: any = {
    currentPage: 1,
    pageSize: 100,
    sortOption: {
      sortBy: 'ordering',
      sortType: 'asc'
    },
    myCategoryIds: '',
    total: 0,
    loading: false
  };

  public filterMyTopic: any = {
    currentPage: 1,
    pageSize: 100,
    sortOption: {
      sortBy: 'ordering',
      sortType: 'asc'
    },
    mySubjectIds: '',
    total: 0,
    loading: false
  };

  public myCategorySelectedIds: any[] = [];
  public mySubjectSelectedIds: any[] = [];

  public ageFilter: any[] = ageFilter;

  constructor(
    private router: Router,
    private courseService: CourseService,
    private toasty: ToastrService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private gradeService: GradeService,
    private translate: TranslateService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private appService: AppService,
    private systemService: SystemService
  ) {
    this.maxFileSize = this.appService.settings.maximumFileSize;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.checkMobileBrowser = true;
    }
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.loading = true;
    this.courseId = this.route.snapshot.paramMap.get('id');

    this.queryGrades();
    this.courseService
      .findOne(this.courseId)
      .then(resp => {
        this.mainImageUrl = resp.data.mainImage.thumbUrl;
        this.videoUrl = resp.data.videoIntroduction.fileUrl;
        this.course = resp.data;
        this.loading = false;
        this.queryCategories(true);
      })
      .catch(e => {
        this.loading = false;
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
    this.mainImageOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/photos',
      fileFieldName: 'file',
      onFinish: resp => {
        this.course.mainImageId = resp.data._id;
        this.mainImageUrl = resp.data.thumbUrl;
        this.uploadingImage = false;
      },
      onFileSelect: resp => (this.imageSelected = resp),
      accept: 'image/*',
      id: 'image-upload',
      onUploading: resp => (this.uploadingImage = true)
    };
    this.videoOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/videos',
      fileFieldName: 'file',
      onFinish: resp => {
        this.course.introductionVideoId = resp.data._id;
        this.videoUrl = resp.data.fileUrl;
        this.uploadingVideo = false;
      },
      onFileSelect: resp => (this.videoSelected = resp),
      id: 'file-upload',
      accept: 'video/*',
      onUploading: resp => (this.uploadingVideo = true)
    };
  }

  queryCategories(init: boolean = false) {
    this.loading = true;
    this.categoryService
      .search({ take: 100, sort: 'ordering', sortType: 'asc' })
      .then(resp => {
        this.categories = resp.data.items;
        if (init) {
          const myCategorySelected = this.categories.filter(item => this.course.categoryIds.indexOf(item._id) > -1);
          this.myCategorySelectedIds = myCategorySelected.map(item => item._id);
          this.queryMySubjects(this.myCategorySelectedIds.join(','), true);
        }
        this.loading = false;
      })
      .catch(er => {
        this.loading = false;
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  queryGrades() {
    this.gradeService.search({ take: 100, sort: 'ordering', sortType: 'asc' }).then(
      resp => {
        this.grades = resp.data.items;
      },
      err => this.toasty.error(this.translate.instant('Something went wrong, please try again!'))
    );
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid || (this.course.price <= 0 && !this.course.isFree)) {
      return this.toasty.error(this.translate.instant('Invalid form, please try again.'));
    }
    if (this.course.description) {
      this.course.description = this.course.description.replace(
        '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>',
        ''
      );
    }
    this.loading = true;
    if (this.course.isFree === true) this.course.price = 0;
    this.courseService
      .update(
        this.courseId,
        _.pick(this.course, [
          'name',
          'price',
          'description',
          'alias',
          'categoryIds',
          'introductionVideoId',
          'mainImageId',
          'isFree',
          'gradeIds',
          'subjectIds',
          'topicIds',
          'age'
        ])
      )
      .then(resp => {
        this.toasty.success(this.translate.instant('Updated successfully!'));
        this.tab = 2;
        $('html, body').animate({ scrollTop: 100 });
        //this.router.navigate(['/users/courses']);
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        this.toasty.error(
          this.translate.instant((err.data.data && err.data.data.message) || err.data.message || err.data.email)
        );
      });
  }

  onTabSelect(tab: number) {
    this.tab = tab;
    $('html, body').animate({ scrollTop: 100 });
  }

  onSelectMyCategories(items) {
    if (items && items.length) {
      const ids = items.map(item => item._id);
      this.queryMySubjects(ids.join(','));
    } else {
      this.mySubjects = [];
      this.myTopics = [];
      this.course.subjectIds = [];
      this.course.topicIds = [];
    }
  }

  async queryMySubjects(myCategoryIds, init: boolean = false) {
    this.filterMySubject.loading = true;
    const params = Object.assign({
      page: this.filterMySubject.currentPage,
      take: this.filterMySubject.pageSize,
      sort: `${this.filterMySubject.sortOption.sortBy}`,
      sortType: `${this.filterMySubject.sortOption.sortType}`,
      categoryIds: myCategoryIds,
      isActive: true
    });
    this.subjectService
      .search(params)
      .then(resp => {
        if (resp.data && resp.data.items) {
          this.filterMySubject.total = resp.data.count;
          this.mySubjects = resp.data.items;
          const mySubjectSelected = this.mySubjects.filter(item => this.course.subjectIds.indexOf(item._id) > -1);
          this.course.subjectIds = mySubjectSelected.map(item => item._id);
          this.filterMyTopic.mySubjectIds = mySubjectSelected.map(item => item._id).join(',');

          if (init) {
            this.mySubjectSelectedIds = mySubjectSelected.map(item => item._id);
            this.queryMyTopics(this.mySubjectSelectedIds.join(','));
          } else {
            this.queryMyTopics(this.filterMyTopic.mySubjectIds);
          }
        }
        this.filterMySubject.loading = false;
      })
      .catch(err => {
        this.filterMySubject.loading = false;
        return this.toasty.error(
          this.translate.instant(
            err.data && err.data.data && err.data.data.message
              ? err.data.data.message
              : 'Something went wrong, please try again!'
          )
        );
      });
  }

  async onSelectMySubjects(items) {
    if (items && items.length) {
      const ids = items.map(item => item._id);
      this.queryMyTopics(ids.join(','));
    } else {
      this.myTopics = [];
      this.course.topicIds = [];
    }
  }

  queryMyTopics(mySubjectIds) {
    this.filterMyTopic.loading = true;
    const params = Object.assign({
      page: this.filterMyTopic.currentPage,
      take: this.filterMyTopic.pageSize,
      sort: `${this.filterMyTopic.sortOption.sortBy}`,
      sortType: `${this.filterMyTopic.sortOption.sortType}`,
      subjectIds: mySubjectIds,
      isActive: true
    });
    this.topicService
      .search(params)
      .then(resp => {
        this.filterMyTopic.loading = false;
        if (resp.data && resp.data.items) {
          this.filterMyTopic.total = resp.data.count;
          this.myTopics = resp.data.items;
          const myTopicSelected = this.myTopics.filter(item => this.course.topicIds.indexOf(item._id) > -1);
          this.course.topicIds = myTopicSelected.map(item => item._id);
        }
      })
      .catch(err => {
        this.filterMyTopic.loading = true;
        return this.toasty.error(
          this.translate.instant(
            err.data && err.data.data && err.data.data.message
              ? err.data.data.message
              : 'Something went wrong, please try again!'
          )
        );
      });
  }
}
