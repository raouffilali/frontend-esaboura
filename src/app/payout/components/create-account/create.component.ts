import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SeoService, SystemService } from '../../../shared/services';
import * as _ from 'lodash';
import { IPayoutAccount } from '../interface';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'account-create',
  templateUrl: './form.html'
})
export class AccountCreateComponent implements OnInit {
  public isSubmitted: boolean = false;
  public accounts: IPayoutAccount[] = [];
  public account: IPayoutAccount = {
    type: 'algeria-post',
    paypalAccount: '',
    // ??----------------------------New Feature--------------------------------
    clientName: '',
    ccp: '',
    cle: '',
    rip: '',
    // ??----------------------------New Feature--------------------------------
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    bankName: '',
    bankAddress: '',
    sortCode: '',
    routingNumber: '',
    swiftCode: '',
    ifscCode: '',
    routingCode: ''
  };
  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private toasty: ToastrService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    seoService.update('Create account');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.accounts = this.route.snapshot.data['account'];
  }

  private isAlgeriaPostAccountInvalid(): boolean {
    return this.account.ccp === '' || this.account.cle === '' || this.account.rip === '';
  }

  submit(frm: any) {
    this.isSubmitted = true;
    if (frm.invalid) {
      return this.toasty.error(this.translate.instant('Form is invalid, please try again.'));
    }
    if (this.account.type === 'paypal' && this.account.paypalAccount == '') {
      return this.toasty.error(
        this.translate.instant('If you select type payout is paypal, please enter Paypal Account')
      );
    }
    if (this.account.type === 'algeria-post' && this.isAlgeriaPostAccountInvalid()) {
      return this.toasty.error(
        this.translate.instant('If you select type payout is algeria-post, please enter CCP, CLE, and RIP')
      );
    }
console.log({"ln79": this.account});
    this.accountService.create(this.account).then(
      () => {
        this.toasty.success(this.translate.instant('Account has been created'));
        this.router.navigate(['/users/payout/account']);
      },
      err =>
        this.toasty.error(
          this.translate.instant(err.data.data.message || 'Something went wrong, please check and try again!')
        )
    );
  }
}
