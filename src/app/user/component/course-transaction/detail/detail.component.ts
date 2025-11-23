import { AuthService } from './../../../../shared/services/auth.service';
import { TransactionService } from './../../../../transactions/services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { ITransaction } from './../../../../transactions/interface';
import { Component, OnInit } from '@angular/core';
import { SystemService } from '../../../../shared/services';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './detail.html'
})
export class CourseTransactionDetailComponent implements OnInit {
  public transaction: ITransaction;
  public transactionId: string;
  public tutorId: string;
  public config: any;

  public rtl: boolean = false;
  public langChange: Subscription;
  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private authService: AuthService,
    private systemService: SystemService
  ) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }
  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.authService.getCurrentUser().then(resp => {
      this.tutorId = resp._id;
      this.transactionService.findOneTransactionCourse(this.tutorId, this.transactionId).then(resp => {
        this.transaction = resp.data;
      });
    });
  }
}
