import { AuthService } from './../../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../app.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../../../shared/services';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html'
})
export class FooterComponent implements OnInit {
  public appConfig: any;
  public subjects: any = [];
  public posts: any = [];
  public config: any = {};
  public textButton = 'Register';
  public isLoggedin: boolean = false;

  public langChange: Subscription;
  public rtl: boolean = false;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService,
    private systemService: SystemService,
    private translate: TranslateService
  ) {
    this.appConfig = this.appService.settings;
    const subjects = this.route.snapshot.data['subjects'];
    this.subjects = subjects;
    const posts = this.route.snapshot.data['posts'];
    this.posts = posts;
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.isLoggedin = this.authService.isLoggedin();
    this.rtl = this.systemService.checkRTL();
  }

  register() {
    if (!this.isLoggedin) {
      this.router.navigate(['/auth/sign-up']);
    } else {
      if (window.confirm(this.translate.instant('Do you want to log out?'))) {
        this.authService.removeToken();
        this.router.navigate(['/auth/sign-up']);
      }
    }
  }
}
