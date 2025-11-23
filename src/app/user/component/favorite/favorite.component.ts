import { ICourse } from './../../../course/interface';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService, FavoriteService, SystemService } from '../../../shared/services';
import { IUser } from '../../../user/interface';
import { IWebinar } from '../../../webinar/interface';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;
@Component({
  templateUrl: 'favorite.html'
})
export class FavoriteComponent implements OnInit {
  public type: string;
  public page: any = 1;
  public pageSize: number = 9;
  public items: any = {
    tutor: [] as IUser[],
    webinar: [] as IWebinar[],
    course: [] as ICourse[]
  };
  public total: any = 0;
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public loading: boolean = false;
  public haveResults: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private route: ActivatedRoute,
    private seoService: SeoService,
    private favoriteService: FavoriteService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    this.seoService.update('My favorite');
    this.route.params.subscribe(params => {
      this.type = params.type === 'groupclass' ? 'webinar' : params.type;
      this.query();
    });
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
  }
  reset() {
    this.page = 1;
    this.items.tutor = [];
    this.items.webinar = [];
    this.items.course = [];
    this.loading = false;
  }
  query() {
    this.reset();
    let params = Object.assign({
      page: this.page,
      take: this.pageSize,
      sort: this.sortOption.sortBy,
      sortType: this.sortOption.sortType
    });

    if (!this.loading) {
      if (this.type) {
        this.loading = true;
        this.favoriteService
          .search(params, this.type)
          .then(resp => {
            if (resp && resp.data && resp.data.items && resp.data.items.length) {
              this.items[this.type] = resp.data.items;
              this.total = resp.data.count;
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            alert(this.translate.instant('Something went wrong, please try again!'));
          });
      }
    }
  }
  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.query();
  }
}
