import { SystemService } from './../../../shared/services/system.service';
import { SeoService } from './../../../shared/services/seo.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../shared/services';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  public type: any = '';
  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private seoService: SeoService,
    private systemService: SystemService
  ) {
    seoService.update('Dashboard');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras && navigation.extras.state && navigation.extras.state.current) {
        this.type = navigation.extras.state.current.type;
      }
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    if (!this.type) {
      this.authService.getCurrentUser().then(resp => {
        this.type = resp.type;
      });
    }
  }
}
