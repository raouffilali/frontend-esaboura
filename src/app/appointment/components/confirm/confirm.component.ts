import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser, ISubject, IMylesson } from '../../../user/interface';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../shared/services';
@Component({
  selector: 'app-stripe',
  templateUrl: './confirm.html'
})
export class ConfirmModalComponent implements OnInit {
  @Input() subject: ISubject;
  @Input() tutor: IUser;
  @Input() slot: IMylesson;
  @Input() price: number = 0;
  @Input() config: any;
  @Input() appliedCoupon: boolean = false;
  public loading: boolean = false;
  public walletBalance: number;
  public currentUser: IUser;
  @Input() rtl: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private toasty: ToastrService,
    private translate: TranslateService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.auth.getCurrentUser().then(resp => (this.currentUser = resp));
  }
  confirm(payMethod: string = 'stripe') {
    this.activeModal.close({ confirmed: true, payMethod });
  }
}
