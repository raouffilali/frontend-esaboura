import { ToastrService } from 'ngx-toastr';
import { PaymentService } from './../../payment.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './cancel.html'
})
export class PaymentCancelComponent implements OnInit, OnDestroy {
  public second: any = 12;
  public interval: any; 
  public satimFailOrderId: string;
  public errorMsg: any;  
  constructor(
    private toasty: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private translate: TranslateService,
  ) {
    //http://localhost:4200/payments/success?token=76B94833LF738764E&PayerID=UFFZDJ33JKXXN
    // le cas satim :
    //http://localhost:4200/payments/cancel?orderId=ykZxgffj0YbHQAAADG26&PayerID=UFFZDJ33JKXXN   
    this.route.queryParams.subscribe(params => {
      this.satimFailOrderId = params.orderId;
    });
  }
  ngOnInit() {
    if (this.satimFailOrderId)
      this.paymentService
        .updateSatimFailedTransaction(this.satimFailOrderId)
        .then(resp => {
           // console.log({ 'les data received from backend (transaction table) -slickpay.controller.ts - ln 34': resp.data });
          const paymentInfo = resp.data.paymentInfo;
          // const  respCode_desc = typeof (paymentInfo.params) !== 'undefined' ? paymentInfo.params.respCode_desc :'0';
          // const actionCodeDescription = paymentInfo.actionCodeDescription !== undefined ? paymentInfo.actionCodeDescription :'0';
          // this.errorMsg = respCode_desc !== 0 ? respCode_desc  !== 0 : actionCodeDescription ? actionCodeDescription : 'Your transaction was rejected';
          // console.log({ 'actionCodeDescription - ln 34': actionCodeDescription });
          if (typeof paymentInfo.params !== 'undefined') {
            this.errorMsg = paymentInfo.params.respCode_desc;
          } else if (typeof paymentInfo.actionCodeDescription !== 'undefined')
          {
            this.errorMsg = paymentInfo.actionCodeDescription;
          } else { 
            this.errorMsg = 'Your transaction was rejected'; }
          // const errorMsg = resp.data.paymentInfo.actionCodeDescription;
          // if (respCode_desc){
          // // this.errorMsg = respCode_desc;
          // this.toasty.error(this.translate.instant(paymentInfo.params.respCode_desc));
          // } else if (actionCodeDescription ) 
          // //  this.errorMsg = actionCodeDescription;
          // this.toasty.error(this.translate.instant(paymentInfo.actionCodeDescription));
          //  else 
          //   this.toasty.error(this.translate.instant('Your transaction was rejected'));
          //   // this.errorMsg = 'Your transaction was rejected';          

          // this.timer();
        })
        .catch(e => this.toasty.error(e.data.message));
    else {
      this.timer();
      // console.log('rani hna cancel ln 42');
    }

  }

  timer() {
    this.second = 11;
    this.interval = window.setInterval(() => {
      if (this.second > 0) {
        this.second = this.second - 1;
      } else {
        window.clearInterval(this.interval);
        this.router.navigate(['/users/transaction/list']);
      }
    }, 1000);
  }
  ngOnDestroy() {
    window.clearInterval(this.interval);
  }
}
