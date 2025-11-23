import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { ISection } from '../../../../course/interface';
import { pick } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../../app.service';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.html'
})
export class SectionFormComponent implements OnInit {
  @Input() section: ISection = {};
  @Input() rtl: boolean = false;
  public submitted: boolean = false;
  public videoOptions: any;
  public uploading: boolean = false;
  public videoSelected: any[] = [];
  public videoUrl: string = '';
  constructor(
    private toasty: ToastrService,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.videoUrl = this.section.trialVideo ? this.section.trialVideo.fileUrl : null;
    this.videoOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/videos',
      fileFieldName: 'file',
      onFinish: resp => {
        this.uploading = false;
        this.section.trialVideoId = resp.data._id;
        this.videoUrl = resp.data.fileUrl;
      },
      id: 'section-video-trial',
      accept: 'video/*',
      onUploading: resp => (this.uploading = true),
      onFileSelect: resp => (this.videoSelected = resp)
    };
  }

  submit(frm: any) {
    this.submitted = true;
    if (!frm.valid || this.section.ordering < 0) {
      return this.toasty.error(this.translate.instant('Please complete the required fields!'));
    }
    this.activeModal.close(pick(this.section, ['title', 'description', 'ordering', 'trialVideoId']));
  }
}
