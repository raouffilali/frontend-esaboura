import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { CalendarService } from '../../../../../calendar/services/calendar.service';

interface IRecurring {
  start: string;
  end: string;
  range: {
    start: Date;
    end: Date;
  };
  isFree: boolean;
  dayOfWeek: Array<number>;
}

@Component({
  selector: 'app-recurring-from',
  templateUrl: './modal-recurring.html',
  styleUrls: ['./recurring.scss']
})
export class RecurringForm implements OnInit {
  @Input() isFree: boolean = false;
  @Input() slotDuration: number = 40;
  @Input() rtl: boolean = false;
  public recurring: IRecurring;
  public dayOfWeek = [
    {
      name: 'Monday',
      index: 1
    },
    {
      name: 'Tuesday',
      index: 2
    },
    {
      name: 'Wednesday',
      index: 3
    },
    {
      name: 'Thursday',
      index: 4
    },
    {
      name: 'Friday',
      index: 5
    },
    {
      name: 'Saturday',
      index: 6
    },
    {
      name: 'Sunday',
      index: 0
    }
  ];
  timeStart = { hour: 0, minute: 0 };
  timeEnd = { hour: 0, minute: 0 };
  public range = {
    start: {
      day: 0,
      month: 0,
      year: 0
    },
    end: {
      day: 0,
      month: 0,
      year: 0
    }
  };
  public isSubmitted: Boolean = false;
  public validTime = {};
  public tab: string = 'list';

  constructor(
    private toasty: ToastrService,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private calendarService: CalendarService
  ) {}

  ngOnInit() {
    this.recurring = {
      start: '',
      end: '',
      range: {
        start: null,
        end: null
      },
      dayOfWeek: [],
      isFree: this.isFree
    };
    this.slotDuration = typeof this.slotDuration === 'string' ? parseInt(this.slotDuration, 10) : this.slotDuration;
  }

  selectDate(event: NgbDate, field) {
    const date = `${event.day}-${event.month}-${event.year}`;
    if (
      moment(date, 'DD/MM/YYYY')
        .add(30, 'second')
        .utc()
        .isBefore(moment().set('hour', 0).set('minute', 0).set('second', 0))
    ) {
      this.validTime[field] = true;
      return this.toasty.error(
        this.translate.instant('Please select end date greater than or equal to the start date')
      );
    }
    this.validTime[field] = false;
    this.recurring.range[field] = new Date(event.year, event.month - 1, event.day).toString();
    if (
      this.recurring.range.start &&
      this.recurring.range.end &&
      moment(this.recurring.range.start).isSameOrAfter(moment(this.recurring.range.end))
    ) {
      this.validTime[field] = true;
      return this.toasty.error(this.translate.instant('The end date must be greater than the day to start'));
    } else {
      this.recurring.range.start = moment(this.recurring.range.start)
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .toDate();
      this.recurring.range.end = moment(this.recurring.range.end)
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .toDate();
      this.validTime[field] = false;
    }
  }

  submit(frm) {
    try {
      this.isSubmitted = true;
      this.recurring.start = `${this.timeStart.hour}:${this.timeStart.minute}`;
      this.recurring.end = `${this.timeEnd.hour}:${this.timeEnd.minute}`;
      if (!frm.valid || !this.recurring.range.start || !this.recurring.range.end) {
        return this.toasty.error(this.translate.instant('Invalid form, please try again.'));
      }
      if (
        this.timeStart.hour === this.timeEnd.hour &&
        this.timeEnd.minute - this.timeStart.minute < this.slotDuration
      ) {
        return this.toasty.error(this.translate.instant(`Time allowed is ${this.slotDuration} minutes`));
      }
      if (this.timeEnd.hour < this.timeStart.hour) {
        if (this.timeStart.hour !== 23) {
          return this.toasty.error(this.translate.instant('Time end must be greater than start time'));
        }
      }
      if (this.timeEnd.hour === this.timeStart.hour) {
        if (this.timeStart.minute - this.timeEnd.minute >= 0) {
          return this.toasty.error(this.translate.instant('Time end must be greater than start time'));
        }
      }
      const minute =
        (moment(moment(this.recurring.end, 'HH:mm').toDate()).unix() -
          moment(moment(this.recurring.start, 'HH:mm').toDate()).unix()) /
        60;
      if (minute > this.slotDuration) {
        return this.toasty.error(this.translate.instant(`Maximum time allowed is ${this.slotDuration} minutes!`));
      }
      this.calendarService.createRecurring(this.recurring).then(
        resp => {
          this.toasty.success(this.translate.instant('Recurring events have been created'));
          this.activeModal.close(resp.data);
        },
        err => this.toasty.error(this.translate.instant(err.data.message || 'Something went wrong!'))
      );
    } catch (error) {
      this.toasty.error(this.translate.instant('Something went wrong!'));
      this.activeModal.close(null);
    }
  }

  close(data) {
    this.activeModal.close(data);
  }

  changeTab(tab) {
    this.tab = tab;
  }
}
