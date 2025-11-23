import { Component } from '@angular/core';
import { RequestRefundService } from '../../services/request-refund.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IRefund } from '../../interface';
import { Subscription } from 'rxjs';
import { SystemService } from '../../../shared/services';
@Component({
  selector: 'view-request-refund',
  templateUrl: './detail.html'
})
export class DetailRefundRequestComponent {
  public item: IRefund = {
    _id: '1',
    amount: 10,
    reason: 'aaaa',
    status: 'approved',
    createdAt: '12/2/2011'
  };
  public config: any;
  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private refundService: RequestRefundService,
    private toasty: ToastrService,
    private systemService: SystemService
  ) {
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
    this.rtl = this.systemService.checkRTL();
    const id = this.route.snapshot.params.id;
    this.config = this.route.snapshot.data['appConfig'];
    this.refundService.findOne(id).then(res => {
      this.item = res.data;
    });
  }
}
