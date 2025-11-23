import { SeoService } from './../../../shared/services/seo.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { PostService } from '../../../shared/services/posts.service';
import { IPost } from '../../interface';
import { Subscription } from 'rxjs';
import { SystemService } from '../../../shared/services';
@Component({
  selector: 'detail-post',
  templateUrl: './detail.html'
})
export class PostDetailComponent implements OnInit {
  public post: IPost = {};
  private alias: any;
  public submitted: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private systemService: SystemService,
    private seoService: SeoService
  ) {
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });

    this.route.params.subscribe(params => {
      this.alias = params.alias;
      this.postService.findOne(this.alias).then(resp => {
        this.post = _.pick(resp.data, ['title', 'alias', 'content', 'type']);
        this.seoService.update(this.post.title);
      });
    });
  }
  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
  }
}
