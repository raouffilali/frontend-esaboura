import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { TransactionService } from '../../services/transaction.service';
import { AuthService, SystemService } from '../../../shared/services';
import { RequestRefundService } from '../../../refund/services/request-refund.service';
import { ITransaction } from '../../interface';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'detail-appointment',
  templateUrl: './detail.html'
})
export class AppointmentDetailComponent implements OnInit {
  public transaction: ITransaction = {};
  public options: any = {
    transactionId: '',
    type: 'appointment',
    tutorId: '',
    userId: ''
  };
  private aId: any;
  public type: any;
  public submitted: boolean = false;
  public reason: string = '';
  public config: any;
  public rtl: boolean = false;
  public langChange: Subscription;
  public emailSend: string = '';
  constructor(
    private route: ActivatedRoute,
    private toasty: ToastrService,
    private authService: AuthService,
    private transactionService: TransactionService,
    private refundService: RequestRefundService,
    private translate: TranslateService,
    private location: Location,
    private systemService: SystemService,
  ) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.aId = this.route.snapshot.paramMap.get('id');
    this.authService.getCurrentUser().then(resp => {
      this.type = resp.type;
    });
    this.findOne();
  }
  findOne() {
    this.transactionService.findOne(this.aId).then(resp => {
      this.transaction = resp.data;
      this.options.transactionId = this.transaction._id;
      this.options.tutorId = this.transaction.tutor._id;
      this.options.userId = this.transaction.user._id;
    });
  }

  cancelEvent(info: any) {
    if (!info && info.status !== 'canceled') {
      return this.toasty.error(this.translate.instant('An error has occurred. Try Again.'));
    }
    this.transaction.status = 'canceled';
  }

  request(type?: string) {
    this.submitted = true;
    if (this.reason === '') {
      return this.toasty.error(this.translate.instant('Please enter reason'));
    }
    this.refundService
      .create({
        transactionId: this.transaction._id,
        reason: this.reason,
        type,
        targetType: this.transaction.targetType
      })
      .then(resp => {
        this.location.back();
        this.toasty.success(this.translate.instant('Request successfully!'));
      })
      .catch(e => this.toasty.error(this.translate.instant(e.data.message)));
  }
  printPage() {
    window.print();
  }
  exportAsPDF(div_id) {
    $('.hide-pdf').hide(); // pour masquer des element avec la class="hide-pdf".(il faut reafficher just apres telech du pdf)
    let data = document.getElementById(div_id);
    // let w = data.offsetWidth;
    // let h = data.offsetHeight;
    // const title = document.querySelector('#title_id');
    let title = document.createElement('h3');
    title.textContent = 'Payment Details:';
    title.classList.add('alert'); 
    title.classList.add('alert-info');
    title.classList.add('text');
    title.classList.add('text-center');
    title.classList.add('title');
    data.prepend(title);
    let fileWidth = 208;
    let fileHeight = (data.offsetHeight * fileWidth) / data.offsetWidth;
    const options = { background: 'white' };
    domtoimage.toPng(data, options).then(contentDataURL => {
      // let pdf = new jsPDF('p', 'px', [w, h]);
      let pdf = new jsPDF('p', 'mm', 'a4');
        var img  = new Image();
        var img2 = new Image();
        img.src = 'assets/images/logo-satim.png';
        img2.src = 'assets/images/logo/logo-600x600.png';
        pdf.addImage(img, 'PNG', 75, 5, 21, 13);
        pdf.addImage(img2, 'PNG', 110, 5, 15, 15);
      // let pdf = new jsPDF('l', 'cm', 'a4'); //Generates PDF in landscape mode
      //let pdf = new jsPDF('p', 'cm', 'a4'); //Generates PDF in portrait mode
      // pdf.addImage(contentDataURL, 'PNG', 0, 50, w *.5, h *.8);
      pdf.addImage(contentDataURL, 'PNG', 0, 20, fileWidth , fileHeight );
      pdf.save(`Receipt-${this.transaction?.code}-${ this.transaction?.createdAt}.pdf`);
      setTimeout(function () { // Pour reafficher les elemets masqués du pdf class='hide-pdf'
        $(".hide-pdf").show(); 
        }, 10);
      $(".title").remove(); // remove the added above 'title' class to prevent displaying it again and again in the page
        });
  }

  sendEmail() {
    this.transactionService.sendReceipt({ email: this.emailSend, tid: this.aId }).then(resp => {
      if (resp.data.success) {
        return this.toasty.success(this.translate.instant('Email sent Successfully!'));
      }
      this.toasty.error(this.translate.instant('Invite fail'));
    });
  }
}
