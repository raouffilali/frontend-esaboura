import * as $ from 'jquery';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { RestangularModule } from 'ngx-restangular';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxStripeModule } from 'ngx-stripe';

import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { DashboardLayoutComponent } from './layouts/dashboard/dashboard.component';

import { AuthService, CategoryService } from './shared/services';
import { AuthGuard } from './shared/guard/auth.guard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { Approutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './shared/spinner.component';

import { ConfigResolver, LanguageResolver, CategoryResolver } from './shared/resolver';
import { UtilsModule } from './utils/utils.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CurrentUserResolver } from './shared/resolver/current-user.resolver';
import { AppService } from './app.service';
// if you need forms support:
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from '../environments/environment';

export interface IEnvironment {
  production: boolean;
  version: string;
  build: number;
  maximumFileSize: number;
  apiBaseUrl: string;
  platform: string;
  showBuild: boolean;
  stripeKey: string;
  url: string;
  socketUrl: string;
  zoomSDK: string;
  zoomDomain: string;
  zoomSiteUrl: string;
  localPayment: string;
}
// Function for setting the default restangular configuration
export function RestangularConfigFactory(RestangularProvider, appService: AppService) {
  // TODO - change default config
  const config = appService.settings as IEnvironment;
  RestangularProvider.setBaseUrl(config.apiBaseUrl);
  RestangularProvider.addFullRequestInterceptor((element, operation, path, url, headers, params) => {
    // Auto add token to header
    headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
    return {
      headers: headers
    };
  });

  RestangularProvider.addErrorInterceptor((response, subject, responseHandler) => {
    // force logout and relogin
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('isLoggedin');
      // window.location.href = '/auth/login';

      return false; // error handled
    }

    return true; // error not handled
  });
}

export function createTranslateLoader(http: HttpClient, appService: AppService) {
  const config = appService.settings as IEnvironment;
  return new TranslateHttpLoader(http, `${config.apiBaseUrl}/i18n/`, '.json');
  // return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function init_app(appService: AppService) {
  return () => appService.load();
}

@NgModule({
  declarations: [AppComponent, SpinnerComponent, BlankComponent, FullComponent, DashboardLayoutComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot(Approutes, { useHash: false }),
    // Importing RestangularModule and making default configs for restanglar
    RestangularModule.forRoot([AppService], RestangularConfigFactory),
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    }),
    NgSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppService]
      }
    }),
    NgxStripeModule.forRoot(),
    UtilsModule,
    FontAwesomeModule,
    RecaptchaModule,
    RecaptchaFormsModule, 
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptcha.siteKey,
      } as RecaptchaSettings,
    },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy // HashLocationStrategy
    },
    AuthService,
    AuthGuard,
    ConfigResolver,
    LanguageResolver,
    CategoryResolver,
    CategoryService,
    CurrentUserResolver,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
