import { SeoService } from './../../shared/services/seo.service';
import { AfterViewInit, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  templateUrl: 'signup.component.html',
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0
        })
      ),
      transition('void <=> *', animate(300))
    ])
  ]
})
export class SignupComponent implements AfterViewInit {
  public account: any = {
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    type: '',
    timezone: '',
    referralCode: '',
    phoneNumber: ''
  };
  public accountTutor: any = {
    email: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    issueDocument: '',
    resumeDocument: '',
    certificationDocument: '',
    timezone: '',
    introVideoId: '',
    introYoutubeId: '',
    referralCode: '',
    phoneNumber: ''
  };
  public introVideoType: string = 'upload';
  public confirm: any = {
    pw: ''
  };
  public maxFileSize: number;
  public isMath: boolean = false;
  public submitted: boolean = false;
  public idDocumentOptions: any = {};
  public resumeOptions: any = {};
  public certificationOptions: any = {};
  public introVideoOptions: any = {};
  public idDocumentFile: any;
  public resumeFile: any;
  public certificationFile: any;
  public introVideo: any;
  public appConfig: any;
  public loading: boolean = false;
  public agree: boolean = true;

  constructor(
    private auth: AuthService,
    public router: Router,
    private toasty: ToastrService,
    private route: ActivatedRoute,
    private seoService: SeoService,
    private translate: TranslateService,
    private appService: AppService
  ) {
    this.maxFileSize = this.appService.settings.maximumFileSize;
    this.appConfig = this.route.snapshot.data.appConfig;
    if (this.appConfig) {
      let title = this.appConfig.siteName + ' - Sign Up';
      seoService.update(title);
    }

    this.introVideoOptions = {
      url: this.appService.settings.apiBaseUrl + '/tutors/upload-introVideo',
      onCompleteItem: resp => {
        this.accountTutor.introVideoId = resp.data._id;
        this.loading = false;
      },
      onFileSelect: resp => {
        const lastIndex = resp.length - 1;
        const file = resp[lastIndex].file;
        const ext = file.name.split('.').pop().toLowerCase();
        if (['mp4', 'webm', '3gp', 'ogg', 'wmv', 'webm'].indexOf(ext) === -1) {
          this.introVideoOptions.uploader.clearQueue();
          return this.toasty.error(this.translate.instant('Invalid file type'));
        }
        this.introVideo = file;
      },
      uploadOnSelect: true,
      id: 'id-introVideo',
      onUploading: resp => (this.loading = true)
    };

    this.idDocumentOptions = {
      url: this.appService.settings.apiBaseUrl + '/tutors/upload-document',
      onCompleteItem: resp => {
        this.accountTutor.issueDocument = resp.data._id;
        this.loading = false;
      },
      onFileSelect: resp => {
        const lastIndex = resp.length - 1;
        const file = resp[lastIndex].file;
        const ext = file.name.split('.').pop().toLowerCase();
        if (['pdf', 'doc', 'docx', 'zip', 'rar', 'jpg', 'jpeg', 'png'].indexOf(ext) === -1) {
          this.idDocumentOptions.uploader.clearQueue();
          return this.toasty.error(this.translate.instant('Invalid file type'));
        }
        this.idDocumentFile = file;
      },
      uploadOnSelect: true,
      id: 'id-document',
      onUploading: resp => (this.loading = true)
    };
    this.resumeOptions = {
      url: this.appService.settings.apiBaseUrl + '/tutors/upload-document',
      onCompleteItem: resp => {
        this.accountTutor.resumeDocument = resp.data._id;
        this.loading = false;
      },
      onFileSelect: resp => {
        const lastIndex = resp.length - 1;
        const file = resp[lastIndex].file;
        const ext = file.name.split('.').pop().toLowerCase();
        if (['pdf'].indexOf(ext) === -1) {
          this.resumeOptions.uploader.clearQueue();
          return this.toasty.error(this.translate.instant('Invalid file type'));
        }
        this.resumeFile = file;
      },
      uploadOnSelect: true,
      id: 'id-resume',
      onUploading: resp => (this.loading = true)
    };
    this.certificationOptions = {
      url: this.appService.settings.apiBaseUrl + '/tutors/upload-document',
      onCompleteItem: resp => {
        this.accountTutor.certificationDocument = resp.data._id;
        this.loading = false;
      },
      onFileSelect: resp => {
        const lastIndex = resp.length - 1;
        const file = resp[lastIndex].file;
        const ext = file.name.split('.').pop().toLowerCase();
        if (['pdf'].indexOf(ext) === -1) {
          this.certificationOptions.uploader.clearQueue();
          return this.toasty.error(this.translate.instant('Invalid file type'));
        }
        this.certificationFile = file;
      },
      uploadOnSelect: true,
      id: 'id-verification',
      onUploading: resp => (this.loading = true)
    };
  }

  public onlyNumberKey(event) {
    return event.charCode === 8 || event.charCode === 0 ? null : event.charCode >= 48 && event.charCode <= 57;
  }
  // ?? capitalizeFirstLetter is a function that capitalizes the first letter of a string
  public capitalizeFirstLetter(field: string) {
    if (this.account[field]) {
      this.account[field] = this.account[field].charAt(0).toUpperCase() + this.account[field].slice(1);
    }
  }

  public async submit(frm: any) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }
    if (!this.account.timezone) {
      return this.toasty.error(this.translate.instant('Please select timezone'));
    }
    if (this.account.password !== this.confirm.pw) {
      this.isMath = true;
      return this.toasty.error(this.translate.instant('Confirm password and password dont match'));
    }
    if (this.account.type === '') {
      return this.toasty.error(this.translate.instant('Please select type'));
    }

    this.account.email = this.account.email.toLowerCase();

    if (this.account.type === 'tutor') {
      this.accountTutor.name =
        this.account.firstName && this.account.lastName ? `${this.account.firstName}-${this.account.lastName}` : '';
      this.accountTutor.firstName = this.account.firstName;
      this.accountTutor.lastName = this.account.lastName;
      this.accountTutor.email = this.account.email;
      this.accountTutor.password = this.account.password;
      this.accountTutor.timezone = this.account.timezone;
      this.accountTutor.referralCode = this.account.referralCode;
      this.accountTutor.phoneNumber = this.account.phoneNumber;

      if (this.introVideoType == 'upload' && !this.accountTutor.introVideoId) {
        return this.toasty.error(this.translate.instant('Please upload introduction video'));
      }
      if (this.introVideoType === 'youtube') {
        this.accountTutor.introVideoId = null;
      }
      //-------------- OLD CODE WITH COMPLECTED IF STATEMENT-----------------
      // if (
      //   !this.accountTutor.issueDocument ||
      //   !this.accountTutor.resumeDocument ||
      //   !this.accountTutor.certificationDocument
      // ) {
      //   return this.toasty.error(this.translate.instant('Please upload all documents'));
      // }
      //-------------- NEW CODE WITH SIMPLE IF STATEMENT (complexity deacresing)-----------------
      const isDocumentMissing =
        !this.accountTutor.issueDocument ||
        !this.accountTutor.resumeDocument ||
        !this.accountTutor.certificationDocument;

      if (isDocumentMissing) {
        return this.toasty.error(this.translate.instant('Please upload all documents'));
      }
      //-------------- Old auth -----------------
      // return this.auth
      //   .registerTutor(this.accountTutor)
      //   .then(resp => {
      //     this.toasty.success(
      //       this.translate.instant('Your account has been created, please verify your email then login')
      //     );
      //     this.router.navigate(['/auth/login']);
      //   })
      //   .catch(err =>
      //     this.toasty.error(this.translate.instant(err.data.data.message ? err.data.data.message : err.data.message))
      //   );
      // ?? ----------------- New auth -----------------
      return this.auth
        .registerTutor(this.accountTutor)
        .then(resp => {
          this.toasty.success(
            this.translate.instant(
              'Your account has been created, To activate it please check your email inbox and click on the activation link'
            ),
            'Success', // Title
            {
              positionClass: 'toast-top-right', // Set the position
              progressBar: true, // Show a progress bar
              timeOut: 5000, // Time to close the toast in milliseconds
              extendedTimeOut: 2000, // Time to close the toast after hover in milliseconds
              closeButton: true, // Show a close button
              tapToDismiss: false, // Disable close on click
              progressAnimation: 'increasing', // Animation type for the progress bar
              enableHtml: true // Enable HTML content in the toast message
            }
          );
          this.router.navigate(['/auth/login']);
        })
        .catch(err =>
          this.toasty.error(
            this.translate.instant(err.data.data.message ? err.data.data.message : err.data.message),
            'Error', // Title
            {
              positionClass: 'toast-top-right', // Set the position
              progressBar: true, // Show a progress bar
              timeOut: 5000, // Time to close the toast in milliseconds
              extendedTimeOut: 2000, // Time to close the toast after hover in milliseconds
              closeButton: true, // Show a close button
              tapToDismiss: false, // Disable close on click
              progressAnimation: 'increasing', // Animation type for the progress bar
              enableHtml: true // Enable HTML content in the toast message
            }
          )
        );
    }
    // -------------- Old auth -----------------
    // this.auth
    //   .register(this.account)
    //   .then(resp => {
    //     this.toasty.success(
    //       this.translate.instant('Your account has been created, please verify your email then login')
    //     );
    //     this.router.navigate(['/auth/login']);
    //   })
    //   .catch(err => this.toasty.error(this.translate.instant(err.data.data.message)));
    // ?? -------------- New auth -----------------
    this.account.name =
      this.account.firstName && this.account.lastName ? `${this.account.firstName} ${this.account.lastName}` : '';
    return this.auth
      .register(this.account)
      .then(resp => {
        this.toasty.success(
          this.translate.instant(
            'Your account has been created, To activate it please check your email inbox and click on the activation link'
          ),
          'Success', // Title
          {
            positionClass: 'toast-top-right', // Set the position
            progressBar: true, // Show a progress bar
            timeOut: 5000, // Time to close the toast in milliseconds
            extendedTimeOut: 2000, // Time to close the toast after hover in milliseconds
            closeButton: true, // Show a close button
            tapToDismiss: false, // Disable close on click
            progressAnimation: 'increasing', // Animation type for the progress bar
            enableHtml: true // Enable HTML content in the toast message
          }
        );
        this.router.navigate(['/auth/login']);
      })
      .catch(err =>
        this.toasty.error(
          this.translate.instant(err.data.data.message ? err.data.data.message : err.data.message),
          'Error', // Title
          {
            positionClass: 'toast-top-right', // Set the position
            progressBar: true, // Show a progress bar
            timeOut: 5000, // Time to close the toast in milliseconds
            extendedTimeOut: 2000, // Time to close the toast after hover in milliseconds
            closeButton: true, // Show a close button
            tapToDismiss: false, // Disable close on click
            progressAnimation: 'increasing', // Animation type for the progress bar
            enableHtml: true // Enable HTML content in the toast message
          }
        )
      );
  }

  changeTimezone(event) {
    if (event === 'Asia/Saigon') {
      this.account.timezone = 'Asia/Ho_Chi_Minh';
    } else {
      this.account.timezone = event;
    }
  }

  changeUploadType(event) {
    if (event.target.value === 'youtube') {
      this.accountTutor.introYoutubeId = 'ZU0gjnRU-Z4';
    } else {
      this.accountTutor.introYoutubeId = '';
    }
  }

  // ?? this is the new code for ngAfterViewInit that handle handle both pasting and manual typing removing spaces
  ngAfterViewInit() {
    const target = document.getElementById('email-input');

    const removeSpaces = (event: any) => {
      // Remove spaces from the input value
      const sanitizedText = event.target.value.replace(/ /g, '');
      event.target.value = sanitizedText;
      // Update the account email without spaces
      this.account.email = sanitizedText;
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
        this.account.email = sanitizedText;
      },
      false
    );
  }
  // !! this is the old code for ngAfterViewInit that handle pasting only
  // ngAfterViewInit() {
  //   const target = document.getElementById('email-input');
  //   target.addEventListener(
  //     'paste',
  //     (event: any) => {
  //       event.preventDefault();
  //       const clipboard = event.clipboardData,
  //         text = clipboard.getData('Text');
  //       event.target.value = text.replace(/ /g, '');
  //       this.account.email = text.replace(/ /g, '');
  //     },
  //     false
  //   );
  // }
}
