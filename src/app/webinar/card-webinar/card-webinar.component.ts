import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { IWebinar } from '../interface';
import { ActivatedRoute } from '@angular/router';
import { WebinarService } from '../webinar.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../../shared/services';
declare var jQuery: any;
@Component({
  selector: 'app-card-webinar',
  templateUrl: './card-webinar.html'
})
export class CardWebinarComponent implements OnInit, AfterViewInit {
  @Input() webinar: IWebinar;
  public description: string;
  public rtl: boolean = false;
  public langChange: Subscription;
  @Input() config: any;
  public latestSlot: any;
  public lastDate: any;
  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toasty: ToastrService,
    private systemService: SystemService,
    private webinarService: WebinarService
  ) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }
currentDate = new Date().toISOString();

ngOnInit() {
  // set the current date to the current date and time in the user's timezone
  this.currentDate = new Date().toISOString();
  this.rtl = this.systemService.checkRTL();
  this.webinarService
    .getLatest(this.webinar._id)
    .then(res => {
      if (res.data && res.data.latest) this.latestSlot = new Date(res.data.latest);
      if (res.data && res.data.lastDate) this.lastDate = new Date(res.data.lastDate);
    })
    .catch(e => {
      this.toasty.error(this.translate.instant('something went wrong!'));
    });
}

  ngAfterViewInit() {}
}
