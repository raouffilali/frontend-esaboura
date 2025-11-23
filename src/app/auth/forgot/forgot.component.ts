import { AfterViewInit, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'forgot.component.html'
})
export class ForgotComponent implements AfterViewInit {
  private Auth: AuthService;
  public credentials = {
    email: ''
  };
  public submitted: Boolean = false;
  public appConfig: any;

  constructor(
    auth: AuthService,
    public router: Router,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.Auth = auth;

    // if (auth.isLoggedIn()) {
    // 	this.router.navigate(['/']);
    // }
    this.appConfig = this.route.snapshot.data.appConfig;
  }

  login(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.Auth.forgot(this.credentials.email.toLowerCase())
      .then(() => {
        this.toasty.success(this.translate.instant('An email was sent to your address'));
        this.router.navigate(['/auth/login']);
      })
      .catch(() => this.toasty.error(this.translate.instant('Error, Please check your email again!')));
  }

  ngAfterViewInit() {
    const target = document.getElementById('email-input');
    target.addEventListener(
      'paste',
      (event: any) => {
        event.preventDefault();
        const clipboard = event.clipboardData,
          text = clipboard.getData('Text');
        event.target.value = text.replace(/ /g, '');
        this.credentials.email = text.replace(/ /g, '');
      },
      false
    );
  }
}
