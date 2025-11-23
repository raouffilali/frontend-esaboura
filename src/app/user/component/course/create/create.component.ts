import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  AuthService,
  CategoryService,
  CourseService,
  SubjectService,
  SystemService,
  TopicService
} from '../../../../shared/services';
import { ICourse } from '../../../../course/interface';
import { ICategory } from '../../../../categories/interface';
import { pick } from 'lodash';
import { GradeService } from '../../../../tutor/services/grade.service';
import { IUser } from '../../../interface';
import { TranslateService } from '@ngx-translate/core';
import { ageFilter } from '../../../../utils/utils';
import { AppService } from '../../../../app.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-course-create',
  templateUrl: '../form.html'
})
export class CourseCreateComponent implements OnInit {
  public maxFileSize: any;
  public tab: number = 1;
  public course: ICourse = {
    name: '',
    price: 0,
    categoryIds: [],
    description: '',
    mainImageId: '',
    introductionVideoId: '',
    alias: '',
    isFree: false,
    gradeIds: [],
    subjectIds: [],
    topicIds: []
  };
  public loading: boolean = false;
  public isFree: boolean = false;
  public categories: ICategory[] = [];
  public isSubmitted: Boolean = false;
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

  public currentUser: IUser;
  public ageFilter: any[] = ageFilter;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private courseService: CourseService,
    private toasty: ToastrService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private gradeService: GradeService,
    private authService: AuthService,
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
    if (this.authService.isLoggedin()) {
      this.authService.getCurrentUser().then(resp => {
        this.currentUser = resp;
        if (this.currentUser._id) {
          this.course.tutorId = this.currentUser._id;
        }
      });
    }
    this.rtl = this.systemService.checkRTL();
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
    this.queryCategories();
    this.queryGrades();
  }

  queryCategories() {
    this.loading = true;
    this.categoryService
      .search({ take: 100, sort: 'ordering', sortType: 'asc', isActive: true })
      .then(resp => {
        this.categories = resp.data.items;
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

    if (this.course.isFree === true) this.course.price = 0;

    if (!this.course.mainImageId)
      return this.toasty.error(this.translate.instant('Please upload main image for course!'));
    if (!this.course.introductionVideoId)
      return this.toasty.error(this.translate.instant('Please upload introduction video for course!'));

    if (!this.course._id && this.course.mainImageId && this.course.introductionVideoId) {
      this.courseService.create(this.course).then(
        resp => {
          this.toasty.success(this.translate.instant('Course has been created'));
          this.course = resp.data;
          this.tab = 2;
          $('html, body').animate({ scrollTop: 100 });
          //this.router.navigate(['/users/courses/' + resp.data._id]);
        },
        err => this.toasty.error(this.translate.instant(err.data.message || 'Something went wrong!'))
      );
    } else if (this.course._id) {
      if (this.course.isFree === true) this.course.price = 0;
      this.courseService
        .update(
          this.course._id,
          pick(this.course, [
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
          this.toasty.success(this.translate.instant('Updated successsfully!'));
          this.tab = 2;
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          this.toasty.error(
            this.translate.instant((err.data.data && err.data.data.message) || err.data.message || err.data.email)
          );
        });
    }
  }

  onTabSelect(tab: number) {
    this.tab = tab;
    $('html, body').animate({ scrollTop: 100 });
  }

  onSelectMyCategories(items) {
    if (items && items.length) {
      const ids = items.map(item => item._id);
      this.filterMySubject.myCategoryIds = ids.join(',');
      this.queryMySubjects();
    } else {
      this.mySubjects = [];
      this.myTopics = [];
      this.course.subjectIds = [];
      this.course.topicIds = [];
    }
  }

  queryMySubjects() {
    this.filterMySubject.loading = true;
    const params = Object.assign({
      page: this.filterMySubject.currentPage,
      take: this.filterMySubject.pageSize,
      sort: `${this.filterMySubject.sortOption.sortBy}`,
      sortType: `${this.filterMySubject.sortOption.sortType}`,
      categoryIds: this.filterMySubject.myCategoryIds,
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
          this.queryMyTopics();
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

  onSelectMySubjects(items) {
    if (items && items.length) {
      const ids = items.map(item => item._id);
      this.filterMyTopic.mySubjectIds = ids.join(',');
      this.queryMyTopics();
    } else {
      this.myTopics = [];
      this.course.topicIds = [];
    }
  }

  queryMyTopics() {
    this.filterMyTopic.loading = true;
    const params = Object.assign({
      page: this.filterMyTopic.currentPage,
      take: this.filterMyTopic.pageSize,
      sort: `${this.filterMyTopic.sortOption.sortBy}`,
      sortType: `${this.filterMyTopic.sortOption.sortType}`,
      subjectIds: this.filterMyTopic.mySubjectIds,
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
