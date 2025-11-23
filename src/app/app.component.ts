import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, SeoService, SystemService, UtilService } from './shared/services';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart, NavigationCancel } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WelcomePopupComponent } from './utils/components/welcome-popup.component';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'app';
  public config: any;

  private seoChangedSubscription: Subscription;
  public langChange: Subscription;
  public loading: Subscription;
  constructor(
    private router: Router,
    private authService: AuthService,
    private seoService: SeoService,
    private translate: TranslateService,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private utilService: UtilService
  ) {
    this.seoChangedSubscription = seoService.seoChanged$.subscribe(data => {
      if (!data) {
        return;
      }
      if (data.title) {
        document.title = data.title;
      }
      if (data.meta) {
        $('meta[name="description"]').attr('content', data.meta.description);
        $('meta[name="keywords"]').attr('content', data.meta.keywords);
        $('meta[property="og:description"]').attr('content', data.meta.description);
      } else {
        this.config = this.route.snapshot.data.appConfig;
        if (this.config) {
          this.seoService.update(this.config.siteName, this.config.homeSEO);
        }
      }
    });

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (!this.authService.isLoggedin()) {
          if (event.url !== '/auth/login') {
            localStorage.setItem('currentUrl', event.url);
          }
        }
      }
      if (event instanceof NavigationEnd) {
        if (this.router.url.indexOf('#webinar') === -1 && this.router.url.indexOf('#review') === -1) {
          $('html, body').animate({ scrollTop: 0 });
        } else {
          $('html, body').animate(
            {
              scrollTop:
                this.router.url.indexOf('#webinar') > -1 ? $('#webinar').offset().top : $('#review').offset().top
            },
            1000
          );
        }
        if (!this.authService.isLoggedin()) {
          if (event.url !== '/auth/login' && event.url !== '/auth/forgot' && event.url !== '/auth/sign-up') {
            localStorage.setItem('currentUrl', this.router.url);
          } else {
            localStorage.removeItem('currentUrl');
          }
        }
        // if (event.url == '/' || event.url == '/home') {
        //   const notShowPopupAgain = localStorage.getItem('notShowPopupAgain');
        //   if (notShowPopupAgain != 'yes')
        //     this.modalService.open(WelcomePopupComponent, { centered: true, backdrop: 'static', size: 'md' });
        // }
        this.systemService.setUserLang(localStorage.getItem('userLang'));
      }
    });
    const defaultLang = 'en';
    // https://github.com/ngx-translate/core
    translate.setDefaultLang(defaultLang);
    systemService.configs().then(resp => {
      translate.setDefaultLang(resp.i18n.defaultLanguage);
      translate.use(resp.userLang);

      //change favicon
      $('#favicon').attr('href', resp.siteFavicon);

      //render script
      const { script } = resp;
      if (script && script['head'] && script['head'].length) {
        for (const s of script['head']) {
          if (s.isActive) {
            var scriptNode = $(s.script);
            $('head').append(scriptNode);
          }
        }
      }
      if (script && script['body'] && script['body'].length) {
        for (const s of script['body']) {
          if (s.isActive) {
            var scriptNode = $(s.script);
            $('body').append(scriptNode);
          }
        }
      }
    });

    this.langChange = this.systemService.languageChanged$.subscribe(data => {
      this.checkRTL(data);
    });

    this.loading = this.utilService.appLoading$.subscribe(loading => {
      if (!loading) {
        this.checkRTL(localStorage.getItem('userLang'));
      }
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedin()) {
      this.authService.getCurrentUser();
    }
    this.checkRTL(localStorage.getItem('userLang'));
  }

  checkRTL(lang: string) {
    if (lang === 'ar' || lang === 'he') {
      $('html').attr('dir', 'rtl');
      $('html').attr('lang', lang);
      var elements = [
        {
          class: '.text-left',
          toAdd: 'text-right',
          toRemove: 'text-left'
        },
        { class: '.profile.position-left', toAdd: 'position-right', toRemove: 'position-left' },
        { class: '.input-group-append.position-right', toAdd: 'position-left', toRemove: 'position-right' },
        { class: 'div.btn-float-right', toAdd: 'text-left', toRemove: 'text-right' },
        { class: '.link-profile.position-left', toAdd: 'position-right', toRemove: 'position-left' },
        { class: '.money.text-right', toAdd: 'text-left', toRemove: 'text-right' }
      ];
      elements.map(e => {
        $(e.class)
          .map(function () {
            this.classList.add(e.toAdd);
            this.classList.remove(e.toRemove);
          })
          .get();
      });
    } else {
      $('html').attr('dir', 'ltr');
      $('html').attr('lang', lang);
      var elements = [
        {
          class: '.text-right',
          toAdd: 'text-left',
          toRemove: 'text-right'
        },
        { class: '.profile.position-right', toAdd: 'position-left', toRemove: 'position-right' },
        { class: '.input-group-append.position-left', toAdd: 'position-right', toRemove: 'position-left' },
        { class: 'div.btn-float-right', toAdd: 'text-right', toRemove: 'text-left' }
      ];
      elements.map(e => {
        $(e.class)
          .map(function () {
            this.classList.add(e.toAdd);
            this.classList.remove(e.toRemove);
          })
          .get();
      });
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.seoChangedSubscription.unsubscribe();
  }
}
