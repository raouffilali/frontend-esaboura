import { SeoService } from './../../../shared/services/seo.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IReferred } from '../../interface';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../../../shared/services';

@Component({
  selector: 'app-referred-list',
  templateUrl: './referred.html'
})
export class ReferredListComponent implements OnInit {
  public sortOption = {
    sortBy: 'createdAt',
    sortType: 'desc'
  };
  public searchFields: any = {};
  public currentPage: number = 1;
  public pageSize: number = 10;
  public total: number = 0;
  public referredList: IReferred[] = [];
  public timeout: any;
  public loading: boolean = false;
  public config: any;
  public userType: string;
  public rtl: boolean = false;
  public langChange: Subscription;
  public totalEarnings: number;
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private systemService: SystemService
  ) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
    this.route.params.subscribe(params => {
      if (params.type === 'tutors') this.seoService.update('Referred Tutors');
      else this.seoService.update('Referred Students');
      this.searchFields.type = params.type;
      this.getReferredList();
    });
  }

  ngOnInit(): void {
    this.rtl = this.systemService.checkRTL();
    this.userService.me().then(resp => {
      this.userType = resp.data.type;
    });
    this.getReferredList();
  }

  getReferredList() {
    this.loading = true;
    const params = Object.assign(
      {
        page: this.currentPage,
        take: this.pageSize,
        sort: `${this.sortOption.sortBy}`,
        sortType: `${this.sortOption.sortType}`
      },
      this.searchFields
    );
    this.userService.getListReferredByMe(params).then(resp => {
      this.referredList = resp.data.items;
      this.totalEarnings = resp.data.totalEarnings;
      this.total = resp.data.count;
      this.loading = false;
    });
  }

  pageChange() {
    $('html, body').animate({ scrollTop: 0 });
    this.getReferredList();
  }

  sortBy(field: string, type: string) {
    this.sortOption.sortBy = field;
    this.sortOption.sortType = type;
    this.getReferredList();
  }

  onSort(evt) {
    this.sortOption = evt;
    this.getReferredList();
  }
}
