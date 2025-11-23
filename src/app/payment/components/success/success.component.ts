import { ToastrService } from 'ngx-toastr';
import { PaymentService } from './../../payment.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// import { AuthService} from '../../../shared/services';
// import { IUser } from '../../../user/interface';

@Component({
  selector: 'app-payment-success',
  templateUrl: './success.html'
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  public second: any = 1;
  public interval: any;
  public orderId: string;
  public errorMsg: string;
  public ErrorCode: string;
  public jsonParams: any;
  public transactionDate: Date;
  public redirectUrl: string = '/users/transaction/list';

  // public currentUser: IUser;
  public satimSuccessOrderId: string;
  constructor(
    private toasty: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private translate: TranslateService,
    // private auth: AuthService,
  ) {
    // if (this.auth.isLoggedin()) {
    //   this.auth.getCurrentUser().then(resp => (this.currentUser = resp));
    // }

    //http://localhost:4200/payments/success?token=76B94833LF738764E&PayerID=UFFZDJ33JKXXN
    // le cas satim :
    //http://localhost:4200/payments/success?orderId=ykZxgffj0YbHQAAADG26&PayerID=UFFZDJ33JKXXN
    this.route.queryParams.subscribe(params => {
      this.satimSuccessOrderId = params.orderId;
      this.orderId = params.token;
    });
  }
  ngOnInit() {
    if (this.orderId) {
      this.paymentService
        .updateTransaction(this.orderId)
        .then(resp => {
          this.timer();
        })
        .catch(e => this.toasty.error(e.data.message));
    }
    else if (this.satimSuccessOrderId)
      this.paymentService
        .updateSatimTransaction(this.satimSuccessOrderId)
        .then(resp => {
          console.log({ 'Rani hna success.component ln 52': resp.data });
          this.errorMsg = resp.data.paymentInfo.actionCodeDescription;
          this.ErrorCode = resp.data.paymentInfo.ErrorCode;
          // this.jsonParams = resp.data.paymentInfo;
          this.jsonParams = {
            "expiration": resp.data.paymentInfo.expiration,
            "cardholderName": resp.data.paymentInfo.cardholderName,
            "depositAmount": resp.data.paymentInfo.depositAmount,
            "currency": resp.data.paymentInfo.currency,
            "approvalCode": resp.data.paymentInfo.approvalCode,
            "authCode": resp.data.paymentInfo.authCode,
            "params": {
              "udf1": resp.data.paymentInfo.params.udf1,
              "respCode_desc": resp.data.paymentInfo.params.respCode_desc,
              "respCode": resp.data.paymentInfo.params.respCode
            },
            "actionCode": resp.data.paymentInfo.actionCode,
            "actionCodeDescription": resp.data.paymentInfo.actionCodeDescription,
            "ErrorCode": resp.data.paymentInfo.ErrorCode,
            "ErrorMessage": resp.data.paymentInfo.ErrorMessage,
            "OrderStatus": resp.data.paymentInfo.OrderStatus,
            "OrderNumber": resp.data.paymentInfo.OrderNumber,
            "Pan": resp.data.paymentInfo.Pan,
            "Amount": resp.data.paymentInfo.Amount,
            "Ip": resp.data.paymentInfo.Ip,
            "SvfeResponse": resp.data.paymentInfo.SvfeResponse
          };
          this.transactionDate = resp.data.updatedAt;
          // const id = resp.data.id;
          this.redirectUrl = `/users/transaction/${resp.data.id}`;
          console.log({ 'ErrorCode ln 55': this.ErrorCode });
          if (this.ErrorCode !== '0') this.toasty.success(this.translate.instant(this.errorMsg));
          this.timer();
        })
        .catch(e => this.toasty.error(e.data.message));
    else {
      this.timer();
    }
  }

  timer() {
    this.second = 1;
    this.interval = window.setInterval(() => {
      if (this.second > 0) {
        this.second = this.second - 1;
      } else {
        window.clearInterval(this.interval);
        this.router.navigate([this.redirectUrl]);
      }
    }, 1000);
  }

  ngOnDestroy() {
    window.clearInterval(this.interval);
  }
}
