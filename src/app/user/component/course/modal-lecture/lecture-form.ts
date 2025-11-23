import { LectureMediaService } from './../../../../shared/services/lecture-media.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ILecture, ILectureMeida } from '../../../../course/interface';
import { pick } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { randomHash } from '../../../../utils/utils';
import { AppService } from '../../../../app.service';
@Component({
  selector: 'app-lecture-form',
  templateUrl: './lecture-form.html'
})
export class LectureFormComponent implements OnInit {
  @Input() lecture: ILecture = {};
  @Input() courseId: string;
  @Input() rtl: boolean = false;
  public maxFileSize: number;
  public submitted: boolean = false;
  public videoOptions: Object = {};
  public pdfOptions: Object = {};
  public audioOptions: Object = {};
  public mediaType: string = 'video';
  public mediaOptions: Object = {};
  public uploading: boolean = false;
  public lectureMedia: ILectureMeida = {
    mediaType: 'video'
  };
  public hashLecture: string = null;
  public medias: ILectureMeida[] = [];
  constructor(
    private toasty: ToastrService,
    private lectureMediaService: LectureMediaService,
    public activeModal: NgbActiveModal,
    private translate: TranslateService,
    private appService: AppService
  ) {
    this.maxFileSize = this.appService.settings.maximumFileSize;
  }

  ngOnInit() {
    // if (!this.lecture._id) this.lecture.mediaType = 'video';
    if (this.lecture._id)
      this.lectureMediaService.search({ lectureId: this.lecture._id }).then(resp => {
        this.medias = resp.data.items;
      });
    else {
      this.hashLecture = randomHash(32, '');
    }
    this.videoOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/videos',
      fileFieldName: 'file',
      onFinish: resp => {
        this.lectureMediaService
          .create({
            lectureId: this.lecture._id || null,
            hashLecture: this.hashLecture,
            mediaType: 'video',
            mediaId: resp.data._id
          })
          .then(res => {
            this.medias.push(res.data);
            if (this.lecture._id) this.lecture.mediaIds.push(res.data._id);
            this.uploading = false;
          });
      },
      id: 'video-upload',
      accept: 'video/*',
      onUploading: resp => (this.uploading = true)
    };

    this.audioOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/audios',
      fileFieldName: 'file',
      onFinish: resp => {
        this.lectureMediaService
          .create({
            lectureId: this.lecture._id || null,
            hashLecture: this.hashLecture,
            mediaType: 'audio',
            mediaId: resp.data._id
          })
          .then(res => {
            this.medias.push(res.data);
            if (this.lecture._id) this.lecture.mediaIds.push(res.data._id);
            this.uploading = false;
          });
      },
      id: 'audio-upload',
      accept: 'audio/*',
      onUploading: resp => (this.uploading = true)
    };

    this.pdfOptions = {
      url: this.appService.settings.apiBaseUrl + '/media/files',
      fileFieldName: 'file',
      onFinish: resp => {
        this.lectureMediaService
          .create({
            lectureId: this.lecture._id || null,
            hashLecture: this.hashLecture,
            mediaType: 'pdf',
            mediaId: resp.data._id,
            totalLength: this.lectureMedia.totalLength
          })
          .then(res => {
            this.medias.push(res.data);
            if (this.lecture._id) this.lecture.mediaIds.push(res.data._id);
            this.uploading = false;
            this.lectureMedia.totalLength = 0;
          });
      },
      lecturePdf: true,
      id: 'pdf-upload',
      accept: '.pdf',
      onUploading: resp => (this.uploading = true)
    };
    // if (this.lecture.mediaType) this.mediaType = this.lecture.mediaType;
    this.lecture.courseId = this.courseId;
  }

  onUpload(event) {
    console.log('lalala, ', event);
    this.lectureMedia.totalLength = event;
  }
  submit(frm: any) {
    this.submitted = true;
    if (!this.medias.length) this.toasty.error(this.translate.instant('Please upload media content for lecture!'));
    else
      this.activeModal.close(
        Object.assign(pick(this.lecture, ['courseId', 'sectionId', 'title', 'description', 'ordering', 'mediaIds']), {
          hashLecture: this.hashLecture
        })
      );
  }

  checkMediaType(type: string) {
    this.lectureMedia.mediaType = type;
    this.mediaType = type;
  }
  returnDuration(seconds: number) {
    if (seconds == 0) return this.translate.instant('converting');
    else if (seconds < 10) return '00:0' + seconds;
    var duration: string = '';
    if (seconds < 60) return '00:' + seconds;
    else {
      var hour, minute, second;
      hour = seconds < 3600 ? 0 : Math.floor(seconds / 3600);
      if (hour > 0) {
        if (hour < 10) hour = '0' + hour;
        duration = hour + ':';
      }
      var remainSecond = seconds - parseInt(hour) * 3600;
      minute = Math.floor(remainSecond / 60) < 10 ? '0' + Math.floor(remainSecond / 60) : Math.floor(remainSecond / 60);
      second = seconds - parseInt(hour) * 3600 - minute * 60;
      if (second < 10) second = '0' + second;
      return duration + minute + ':' + second;
    }
  }

  removeMedia(item: any, index: number) {
    if (window.confirm(this.translate.instant('Are you sure to delete this media content?'))) {
      this.lectureMediaService
        .delete(item._id)
        .then(() => {
          this.toasty.success(this.translate.instant('Item has been deleted!'));
          this.medias.splice(index, 1);
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }
}
