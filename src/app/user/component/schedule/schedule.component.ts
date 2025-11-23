import { Component, OnInit, ViewChild } from '@angular/core';
import { SeoService, AuthService, SystemService } from '../../../shared/services';
import { IUser } from '../../interface';
import { ScheduleEditComponent } from '../../../calendar/components';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecurringForm } from './recurring-schedule/modal-recurring/modal-recurring.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './schedule.html'
})
export class ScheduleComponent implements OnInit {
  public tab: string = 'schedule';
  public tutor: IUser;
  public loading: boolean = false;
  public rtl: boolean = false;
  public langChange: Subscription;

  @ViewChild('schedulePaid') schedulePaid: ScheduleEditComponent;
  @ViewChild('scheduleFree') scheduleFree: ScheduleEditComponent;

  constructor(
    private authService: AuthService,
    private systemService: SystemService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {
    seoService.update('My Schedule');
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
    this.tutor = this.route.snapshot.data['current'];
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    this.loading = true;
    this.authService.getCurrentUser().then(resp => {
      if (resp._id) {
        this.tutor = resp;
      }
      this.loading = false;
    });
  }

  onTabSelect(tab: string) {
    this.tab = tab;
    if (tab === 'schedule') {
      setTimeout(() => {
        this.schedulePaid.reRender();
      }, 100);
    } else if (tab === 'free') {
      setTimeout(() => {
        this.scheduleFree.reRender();
      }, 100);
    }
  }

  onChange(isFree: boolean) {
    if (!isFree) {
      this.scheduleFree.loadStatic();
    } else {
      this.schedulePaid.loadStatic();
    }
  }

  addRecurring(isFree) {
    const recurringModalRef = this.modalService.open(RecurringForm, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    recurringModalRef.componentInstance.isFree = isFree;
    recurringModalRef.componentInstance.slotDuration = this.tutor.defaultSlotDuration;
    recurringModalRef.componentInstance.rtl = this.rtl;
    recurringModalRef.result.then(
      res => {
        this.scheduleFree.loadStatic();
        this.schedulePaid.loadStatic();
      },
      () => {}
    );
  }
}
