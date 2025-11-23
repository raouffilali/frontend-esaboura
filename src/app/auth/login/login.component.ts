import { SeoService } from './../../shared/services/seo.service';
import { AfterViewInit, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements AfterViewInit {
  private Auth: AuthService;
  public credentials = {
    email: '',
    password: '',
    rememberMe: false
  };
  public submitted: boolean = false;
  public appConfig: any;
  public returnUrl: string;

  constructor(
    auth: AuthService,
    public router: Router,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private translate: TranslateService
  ) {
    this.appConfig = this.route.snapshot.data.appConfig;
    if (this.appConfig) {
      let title = this.appConfig.siteName + ' - Login';
      seoService.update(title);
    }
    this.Auth = auth;
    let currentUrl = localStorage.getItem('currentUrl');
    if (currentUrl && currentUrl === '/auth/sign-up') currentUrl = '/home';
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || currentUrl || '/users/dashboard';
    if (auth.getAccessToken()) {
      this.router.navigate(['/']);
    }
  }

  login(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }
    //?? Apply the desired transformations by removing space and converting to lowercase before sending to server
    this.credentials.email = this.credentials.email.trim().toLowerCase().replace(/\s+/g, '');
    this.Auth.login(this.credentials)
      .then(resp => {
        this.router.navigateByUrl(this.returnUrl, {
          state: {
            current: resp
          }
        });
      })
      .catch(err => {
        if (err) {
          return this.toasty.error(
            this.translate.instant((err.data && err.data.data && err.data.data.message) || err.data.message)
          );
        }
        this.toasty.error(this.translate.instant('Something went wrong, please try again.'));
      });
  }

  // ?? this is the new code for ngAfterViewInit that handle handle both pasting and manual typing removing spaces
  ngAfterViewInit() {
    const target = document.getElementById('email-input');

    const removeSpaces = (event: any) => {
      // Remove spaces from the input value
      const sanitizedText = event.target.value.replace(/ /g, '');
      event.target.value = sanitizedText;
      // Update the account email without spaces
      this.credentials.email = sanitizedText;
    };

    // Listen for 'input' event
    target.addEventListener('input', removeSpaces, false);

    // Listen for 'paste' event
    target.addEventListener(
      'paste',
      (event: any) => {
        event.preventDefault();
        const clipboard = event.clipboardData,
          text = clipboard.getData('Text');
        // Remove spaces from the pasted text
        const sanitizedText = text.replace(/ /g, '');
        event.target.value = sanitizedText;
        // Update the account email without spaces
        this.credentials.email = sanitizedText;
      },
      false
    );
  }
}
