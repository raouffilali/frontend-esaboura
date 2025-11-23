import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploadComponent } from './components/file-upload.component';
import { MediaService } from './service';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarUploadComponent, NgbdModalComponent } from './components/avatar-upload/avatar-upload.component';
import { MediaModalComponent } from './components/media-modal/media-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, FileUploadModule, TranslateModule.forChild()],
  exports: [FileUploadComponent, AvatarUploadComponent],
  declarations: [FileUploadComponent, AvatarUploadComponent, NgbdModalComponent, MediaModalComponent],
  entryComponents: [MediaModalComponent],
  providers: [MediaService]
})
export class MediaModule {}
