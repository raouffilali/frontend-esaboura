import { SectionService } from './../../../shared/services/section.service';
import { IMyCourse } from './../../interface';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-certificate-form',
  templateUrl: './my-certificate.html'
})
export class MyCertificateComponent implements OnInit {
  @Input() myCourse: IMyCourse = {};
  @Input() userName: string = '';
  @Input() appConfig: any;
  public submitted: boolean = false;
  public stringDuration = null;

  public totalLength: number = 0;
  constructor(
    private toasty: ToastrService,
    public activeModal: NgbActiveModal,
    private sectionService: SectionService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.sectionService
      .search({ courseId: this.myCourse.courseId, take: 100, sort: 'ordering', sortType: 'asc' })
      .then(resp => {
        if (resp.data && resp.data.items) {
          resp.data.items.map(item => {
            this.calDuration(item);
            this.totalLength += item.duration;
            //this.course.totalLecture += item.totalLecture;
          });
        } else this.totalLength = 0;
        this.stringDuration = this.returnDurationString(this.totalLength);
      })
      .catch(err => {
        this.toasty.error(
          this.translate.instant(
            err.data && err.data.data && err.data.data.message
              ? err.data.data.message
              : 'Something went wrong, please try again!'
          )
        );
      });
  }

  calDuration(section: any) {
    let countMedia = 0;
    const lectures = section.lectures || [];
    let duration = 0;
    lectures.forEach(item => {
      let lectureDuration = 0;
      item.medias.forEach(media => {
        countMedia++;
        if (media.mediaType === 'pdf') {
          duration += media.totalLength;
          lectureDuration += media.totalLength;
        } else {
          duration += media.media.duration;
          lectureDuration += media.media.duration;
        }
      });
      item.duration = lectureDuration;
    });
    section.duration = duration;
  }

  returnDurationString(seconds: number) {
    if (seconds == 0) return '0h:0m';
    else {
      var h, m, s: number;
      h = Math.floor(seconds / 3600);
      m = Math.floor((seconds - h * 3600) / 60);
      s = seconds - h * 3600 - m * 60;
      if (h > 0) {
        return h + 'h' + m + 'm';
      } else {
        return m + 'm' + s + 's';
      }
    }
  }

  exportAsPDF(div_id) {
    let data = document.getElementById(div_id);
    let w = data.offsetWidth;
    let h = data.offsetHeight;
    let fileWidth = 380;
    let fileHeight = (data.offsetHeight * fileWidth) / data.offsetWidth;
    const options = { background: 'white' };
    domtoimage.toPng(data, options).then(contentDataURL => {
      // let pdf = new jsPDF('l', 'px', [w, h]);
      let pdf = new jsPDF('l', 'mm', 'a4');
      // let pdf = new jsPDF('l', 'cm', 'a4'); //Generates PDF in landscape mode
      //let pdf = new jsPDF('p', 'cm', 'a4'); //Generates PDF in portrait mode
      pdf.addImage(contentDataURL, 'PNG', -40, 0, fileWidth, fileHeight);
      pdf.save('Certificate.pdf');
    });
  }
}
