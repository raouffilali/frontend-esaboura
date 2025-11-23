import { SystemService } from './../../../shared/services/system.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { StripeService, StripeCardComponent } from 'ngx-stripe';
import { ToastrService } from 'ngx-toastr';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, CountryService } from '../../../shared/services';
import { filter } from 'rxjs/operators';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { PaymentService } from '../../payment.service';
import { IUser } from '../../../user/interface';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../app.service';
import { Subscription } from 'rxjs';
import { RecaptchaErrorParameters } from "ng-recaptcha";
import { CourseService } from '../../../shared/services/course.service';
import { WebinarService } from '../../../webinar/webinar.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-pay',
  templateUrl: './pay.html'
})
export class PayComponent implements OnInit {
  checkbox1 = false; // Terms & conditions checkbox
  // paymentOption: string;
  @ViewChild(StripeCardComponent, { static: false }) card: StripeCardComponent;
  public cardHolderName: any = '';
  public cardOptions: any = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: 'rgba(0, 157, 151, 0.75)'
        }
      }
    }
  };
  // optional parameters
  public elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };
  public stripeTest: FormGroup;
  public stripeToken: any = null;
  public loading: boolean = false;
  public errorCard: any;
  public errorText: string;
  public paymentParams: any;
  public type: string;
  public targetType: string;
  public paymentIntent: any;
  public submitted: boolean = false;
  public countries: any;
  public targetName: string;
  public tutorName: string;
  public currentUser: IUser;
  public rtl: boolean = false;
  public langChange: Subscription;
  public emailRecipient: '';
  public price: any;
  public course: any;
  public webinar: any;
  public config: any;
  public recaptchaSiteKey: any;
  constructor(
    private router: Router,
    private stripeService: StripeService,
    private fb: FormBuilder,
    private auth: AuthService,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private countryService: CountryService,
    private translate: TranslateService,
    private appService: AppService,
    private systemService: SystemService,
    private courseService: CourseService,
    private webinarService: WebinarService,
  ) {
    if (this.auth.isLoggedin()) {
      this.auth.getCurrentUser().then(resp => (this.currentUser = resp));
    }
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
    this.type = this.route.snapshot.queryParams.type;
    this.targetType = this.route.snapshot.queryParams.targetType;
    this.targetName = this.route.snapshot.queryParams.targetName;
    this.tutorName = this.route.snapshot.queryParams.tutorName;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras && navigation.extras.state) {
        this.paymentParams = navigation.extras.state;
      }
    });
  }
  ngOnInit() {
    // ANA Added for choosing paiment options : CIB , Stripe
    // this.paymentOption = 'CIB';

    this.config = this.route.snapshot.data['appConfig'];
    this.rtl = this.systemService.checkRTL();
    if (!this.paymentParams) {
      const params = localStorage.getItem('paymentParams');
      if (params) {
        this.paymentParams = JSON.parse(params);
      } else {
        this.router.navigate(['/home']);
      }
    }
    this.paymentParams.payMethod = 'CIB';
    this.recaptchaSiteKey = environment.recaptcha.siteKey;
    // this.paymentParams.localPayment = 'SLICKPAY'; // 'SATIM' or 'SLICKPAY'
    this.paymentParams.localPayment =  environment.localPayment;
    this.countries = this.countryService.getCountry();
    this.stripeService.setKey(this.appService.settings.stripeKey);
    this.stripeTest = this.fb.group({
      name: ['', [Validators.required]],
      address_line1: ['', [Validators.required]],
      address_city: ['', [Validators.required]],
      address_state: ['', [Validators.required]],
      address_country: [undefined, [Validators.required]],
      recaptcha: ['', [Validators.required]],
      voucher_at:[''],
    });
    // console.log( this.paymentParams);
    // console.log( this.type);
    // pour Afficher le prix 
if(this.paymentParams.targetType === 'course') { this.findOneCourse();}
if(this.paymentParams.targetType === 'webinar') { this.findOneWebinar();}

  }

findOneCourse() {
    this.courseService
      .findOne(this.paymentParams.targetId)
      .then(resp => {
        this.course = resp.data;
        this.price = resp.data.price;
console.log( this.course)   ;   
    })
    .catch(err => {
      if (err.data.code == '404') this.router.navigate(['pages/404-not-found']);
      else {
        this.router.navigate(['pages/error', err.data.code]);
      }
    });
}

findOneWebinar() {
  this.webinarService
    .findOne(this.paymentParams.targetId)
    .then(resp => {
      this.webinar = resp.data;
      this.price = resp.data.price || 0;
console.log( this.webinar)   ;   
  })
  .catch(err => {
    if (err.data.code == '404') this.router.navigate(['pages/404-not-found']);
    else {
      this.router.navigate(['pages/error', err.data.code]);
    }
  });
}
  // selectPaymentOption(option: string) {
  //   this.paymentOption = option;
  //   this.paymentParams.payMethod=option;
  // }
  resolved(captchaRes: string) {  // Captcha function
    // console.log(`Resolved response token: ${captchaRes}`);
    const token = captchaRes;
    this.paymentService
        .sendToken(token)
        .then(resp => {
          const data = resp.data
          console.log({ 'ana data ln 135': data });
          console.log(`Resolved response token: ${captchaRes}`);
        })
 }
  public onError(errorDetails: RecaptchaErrorParameters): void { // Captcha function
    console.log(`reCAPTCHA error encountered; details:`, errorDetails);
  }

  buy() {
    if ( (this.paymentParams.payMethod === 'stripe' || this.paymentParams.payMethod === 'CIB' || this.paymentParams.payMethod === 'AT') && this.stripeTest.invalid) {
      return this.toasty.error(this.translate.instant('Please complete the required fields'));
    }

    if (this.type === 'gift' && !this.emailRecipient) {
      this.loading = false;
      return this.toasty.error(this.translate.instant('Please enter email of recipient'));
    }
    
    if (this.paymentParams.payMethod === 'AT' && this.stripeTest.get('voucher_at').value ==='') {
      this.loading = false;
      return this.toasty.error(this.translate.instant('Please enter a voucher code'));
    } 
    if (!this.paymentParams) {
      return this.toasty.error(this.translate.instant('Can not find payment info, please try again!'));
    }
    this.submitted = true;
    this.loading = true;
    this.paymentParams.payMethod === 'AT' ? this.paymentParams.voucher= this.stripeTest.get('voucher_at').value :'';    
    if (this.targetType === 'webinar' || this.targetType === 'course' || this.targetType === 'bundle') {
      this.paymentParams.emailRecipient = this.emailRecipient || '';
      this.paymentService
        .enroll(this.paymentParams)
        .then(resp => {
          this.submitted = false;
          if (this.paymentParams.payMethod === 'stripe' || this.paymentParams.payMethod === 'CIB' || this.paymentParams.payMethod === 'AT') {
            this.paymentIntent = resp.data;
            if (this.paymentIntent.paymentMode === 'test') return this.router.navigate(['/payments/success']);
            if (this.paymentIntent.payMethod === 'AT' && resp.data.paid === true && resp.data.paymentInfo.voucherUsed === true ) return this.router.navigate(['/payments/success']);
            this.confirmPayment();
          } else if (this.paymentParams.payMethod === 'paypal') {
            window.location.href = resp.data;
          }
          // else if (this.paymentParams.payMethod === 'AT') {
          //   this.paymentIntent = resp.data;
          // // TODO: traiter at response
          // if (this.paymentIntent.paymentMode === 'test') return this.router.navigate(['/payments/success']);
          // this.confirmPayment();
          // }
        })
        .catch(err => {
          this.loading = false;
          this.submitted = false;
          this.toasty.error(
            this.translate.instant(
              (err.data && err.data.data && err.data.data.message) ||
                err.data.message ||
                'Something went wrong, please try again!'
            )
          );
          this.router.navigate(['/payments/cancel']);
        });
    } else {
      this.appointmentService
        .create(this.paymentParams)
        .then(resp => {
          this.submitted = false;
          if (this.paymentParams.payMethod === 'stripe' || this.paymentParams.payMethod === 'CIB' || this.paymentParams.payMethod === 'AT') {
            this.paymentIntent = resp.data;
            if (this.paymentIntent.paymentMode === 'test') return this.router.navigate(['/payments/success']);
            this.confirmPayment();
          } else if (this.paymentParams.payMethod === 'paypal') {
            window.location.href = resp.data;
          }
        })
        .catch(err => {
          this.loading = false;
          this.submitted = false;
          localStorage.removeItem('title');
          localStorage.removeItem('paymentParams');
          this.toasty.error(
            this.translate.instant(
              (err.data && err.data.data && err.data.data.message) ||
                err.data.message ||
                'Something went wrong, please try again!'
            )
          );
          this.router.navigate(['/payments/cancel']);
        });
    }
  }

  confirmPayment() {
    const name = this.stripeTest.get('name').value;
    const address_line1 = this.stripeTest.get('address_line1').value;
    const address_city = this.stripeTest.get('address_city').value;
    const address_state = this.stripeTest.get('address_state').value;
    const address_country = this.stripeTest.get('address_country').value;
    const voucher_at = this.stripeTest.get('voucher_at').value;

    //const address_zip = this.stripeTest.get('address_zip').value;
    if (this.paymentParams.payMethod === 'stripe') {
    // if (this.paymentOption === 'Credit Card') {
      this.stripeService
        .confirmCardPayment(this.paymentIntent.stripeClientSecret, {
          payment_method: {
            card: this.card.element,
            billing_details: {
              name
            }
          },
          shipping: {
            name: name,
            address: {
              line1: address_line1,
              city: address_city,
              country: address_country,
              state: address_state
            }
          }
        })
        .subscribe(result => {
          this.loading = false;
          localStorage.removeItem('title');
          localStorage.removeItem('paymentParams');
          if (result && result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            return this.router.navigate(['/payments/success']);
          } else if (result && result.error) {
            this.toasty.error(this.translate.instant(result.error.message));
            return this.router.navigate(['/payments/cancel']);
          }
        });
    }
    // Debut Pour Slick Pay
    if (this.paymentParams.payMethod === 'CIB' && this.paymentParams.localPayment === 'SLICKPAY') {
      //  Ana Ici ajoute mon stripe service solution : au lieu stripe je creie une fonction au backend
      this.paymentService.confirmCardPayment(this.paymentIntent).then(result => {
        // console.log({ 'les data received from backend -confirmCardPayment.ts ln 334': result });
        this.loading = false;
        //
        // localStorage.removeItem('title');
        // localStorage.removeItem('paymentParams');

        // if (result) {
        if (result && result.paymentIntent && result.paymentIntent.success === 1) {
          //  ici je doit faire la mise a jour de la base
          return this.router.navigate(['/payments/success']);
        } else if (result && result.error) {
          // console.log({ 'les data received from backend error': result.error });
          this.toasty.error(this.translate.instant(result.error.message));
          return this.router.navigate(['/payments/cancel']);
        } else if (result.data && result.data.paymentInfo.transfer_success === 1) {
          const satim_url = result.data.paymentInfo.satim_url;
          // return this.router.navigate([satim_url]);
          window.location.href = `${satim_url}`;
        }
      });
      //  Fin Ana Ici ajoute mon stripe service solution : au lieu stripe je creie une fonction au backend
    } 
    //Fin Pour Slick Pay
    // Debut Pour SATIM
    if (this.paymentParams.payMethod === 'CIB' && this.paymentParams.localPayment === 'SATIM') {
       this.paymentIntent.prevUserUrl = window.location.origin;
       this.paymentIntent.userLang = window.localStorage.userLang;       
      //  Ana Ici ajoute mon stripe service solution : au lieu stripe je crie une fonction SATIM au backend
      this.paymentService.confirmCardPaymentSatim(this.paymentIntent).then(result => {
        // console.log({ 'les data received from backend -confirmCardPaymentSatim.ts ln 264': result.data });
        const satim_url = result.data.paymentInfo.satim_url;
        console.log({ 'satim_url ln 266': satim_url });
        this.loading = false;
        if (result && result.paymentIntent && result.paymentIntent.success === 1) {
          //  ici je doit faire la mise a jour de la base
          return this.router.navigate(['/payments/success']);
        } else if (result && result.error) {
          // console.log({ 'les data received from backend error': result.error });
          this.toasty.error(this.translate.instant(result.error.message));
          return this.router.navigate(['/payments/cancel']);
        } else if (result.data && result.data.paymentInfo.satim_errorCode !== "0") {
          // console.log({ 'rani hna ln 274': 'satim error in step 1' });
          this.toasty.error(this.translate.instant(result.data.paymentInfo.satim_errorMessage));
          // return this.router.navigate(['/payments/cancel']);
          // return this.router.navigate([satim_url]);
        } else if (result.data && result.data.paymentInfo.satim_errorCode === "0") {
          // return this.router.navigate([satim_url]);
          window.location.href = `${satim_url}`;
        }
      });
        //  Fin Ana Ici ajoute mon stripe service solution : au lieu stripe je creie une fonction au backend
    }
  }
} // Fin PayComponent implements OnInit