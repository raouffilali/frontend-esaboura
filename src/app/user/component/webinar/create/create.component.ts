import { SystemService } from './../../../../shared/services/system.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  WebinarService,
  CategoryService,
  AuthService,
  SubjectService,
  TopicService
} from '../../../../shared/services';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ageFilter, randomHash } from '../../../../utils/utils';
import { CalendarService } from '../../../../calendar/services/calendar.service';
import { IWebinar } from '../../../../webinar/interface';
import { ICategory } from '../../../../categories/interface';
import { GradeService } from '../../../../tutor/services/grade.service';
import { IUser } from '../../../interface';
import { TranslateService } from '@ngx-translate/core';
import { IMedia } from '../../../../media/interface';
import { MediaService } from '../../../../media/service';
import { AppService } from '../../../../app.service';
import { Subscription } from 'rxjs';

@Component({ selector: 'app-webinar-create', templateUrl: '../form.html' })
export class WebinarCreateComponent implements OnInit, OnDestroy {
  public maxFileSize: number;
  public webinar: IWebinar = {
    name: '',
    maximumStrength: 1,
    categoryIds: [],
    isOpen: false,
    price: 0,
    mediaIds: [],
    mainImageId: '',
    description: '',
    alias: '',
    isFree: false,
    gradeIds: [],
    subjectIds: [],
    topicIds: []
  };
  public categories: ICategory[] = [];
  public isSubmitted: Boolean = false;
  public mediaOptions: any;
  public mainImageOptions: any;
  public medias: any = [];
  public mainImageUrl: String = '';
  public Editor = ClassicEditor;
  public hashWebinar: any;
  public webinarId: any;
  public imageSelected: any[] = [];
  public filesSelected: any[] = [];
  public loading: boolean = false;
  public config: any;

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
  public grades: any[] = [];

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
    private router: Router,
    private webinarService: WebinarService,
    private toasty: ToastrService,
    private categoryService: CategoryService,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private gradeService: GradeService,
    private authService: AuthService,
    private translate: TranslateService,
    private subjectService: SubjectService,
    private topicService: TopicService,
    private readonly mediaService: MediaService,
    private appService: AppService,
    private systemService: SystemService
  ) {
    this.maxFileSize = this.appService.settings.maximumFileSize;
    this.config = this.route.snapshot.data['appConfig'];

    this.currentUser = this.route.snapshot.data['current'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();

    this.mainImageOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/photos',
      fileFieldName: 'file',
      onFinish: resp => {
        this.webinar.mainImageId = resp.data._id;
        this.mainImageUrl = resp.data.thumbUrl;
      },
      onFileSelect: resp => (this.imageSelected = resp),
      accept: 'image/*',
      id: 'image-upload'
    };
    this.mediaOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/files',
      fileFieldName: 'file',
      onFinish: resp => {
        this.webinar.mediaIds.push(resp.data._id);
        this.medias.push(resp.data);
      },
      onFileSelect: resp => (this.filesSelected = resp),
      id: 'file-upload'
    };
    this.queryCategories();
    this.queryGrades();
    this.hashWebinar = localStorage.getItem('hast_webinar');
    if (!this.hashWebinar) {
      this.hashWebinar = randomHash(32, '');
      localStorage.setItem('hast_webinar', this.hashWebinar);
    }
  }

  ngOnDestroy() {
    if (this.hashWebinar) {
      this.calendarService.deleteByHash(this.hashWebinar);
      localStorage.removeItem('hast_webinar');
    }
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
    this.loading = true;
    this.gradeService
      .search({ take: 100, sort: 'ordering', sortType: 'asc' })
      .then(resp => {
        this.grades = resp.data.items;
        this.loading = false;
      })
      .catch(er => {
        this.loading = false;
        this.toasty.error(this.translate.instant('Something went wrong, please try again!'));
      });
  }

  removeMedia(media: IMedia, i: any) {
    this.mediaService
      .remove(media._id)
      .then(resp => {
        if (resp.data && resp.data.ok) {
          this.toasty.success(this.translate.instant('Removed media!'));
          this.webinar.mediaIds.splice(i, 1);
          this.medias.splice(i, 1);
        }
      })
      .catch(err =>
        this.toasty.error(this.translate.instant((err.data.data && err.data.data.message) || err.data.message))
      );
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (!frm.valid) {
      return this.toasty.error(this.translate.instant('Invalid form, please try again.'));
    }
    if (this.webinar.price <= 0 && !this.webinar.isFree) {
      return this.toasty.error(this.translate.instant('Price value should be greater than 0'));
    }
    if (!this.webinar.mainImageId)
      return this.toasty.error(this.translate.instant('Please upload main image for webinar!'));
    if (this.webinar.isFree === true) this.webinar.price = 0;
    if (this.webinar.description) {
      this.webinar.description = this.webinar.description.replace(
        '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>',
        ''
      );
    }
    this.calendarService.checkByHash(this.hashWebinar).then(check => {
      if (!check.data.success) {
        return this.toasty.error(
          this.translate.instant('Please create schedule for group class if you want the group class to be public')
        );
      }
      const data = this.hashWebinar ? Object.assign(this.webinar, { hashWebinar: this.hashWebinar }) : this.webinar;
      this.webinarService.create(data).then(
        resp => {
          localStorage.removeItem('hast_webinar');
          this.toasty.success(this.translate.instant('Group Class created successfully!'));
          this.router.navigate(['/users/groupclass/' + resp.data._id]);
        },
        err => this.toasty.error(this.translate.instant(err.data.message || 'Something went wrong!'))
      );
    });
  }

  onSelectMyCategories(items) {
    if (items && items.length) {
      const ids = items.map(item => item._id);
      this.filterMySubject.myCategoryIds = ids.join(',');
      this.queryMySubjects();
    } else {
      this.mySubjects = [];
      this.myTopics = [];
      this.webinar.subjectIds = [];
      this.webinar.topicIds = [];
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
      // tutorId: this.webinar.tutorId,
      // isActive: true
    });
    this.subjectService
      .search(params)
      .then(resp => {
        if (resp.data && resp.data.items) {
          this.filterMySubject.total = resp.data.count;
          this.mySubjects = resp.data.items;
          const mySubjectSelected = this.mySubjects.filter(item => this.webinar.subjectIds.indexOf(item._id) > -1);
          this.webinar.subjectIds = mySubjectSelected.map(item => item._id);
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
      this.webinar.topicIds = [];
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
      // tutorId: this.webinar.tutorId,
      isActive: true
    });
    this.topicService
      .search(params)
      .then(resp => {
        this.filterMyTopic.loading = false;
        if (resp.data && resp.data.items) {
          this.filterMyTopic.total = resp.data.count;
          this.myTopics = resp.data.items;
          const myTopicSelected = this.myTopics.filter(item => this.webinar.topicIds.indexOf(item._id) > -1);
          this.webinar.topicIds = myTopicSelected.map(item => item._id);
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
