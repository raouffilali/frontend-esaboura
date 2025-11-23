import { PaymentService } from './../payment/payment.service';
import { GradeService } from './../tutor/services/grade.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CourseDetailComponent } from './detail/detail.component';
import { CourseListComponent } from './list/list.component';
import { CourseRoutingModule } from './course.routing';
import { CardCourseComponent } from './card-course/card-course.component';
import { UtilsModule } from '../utils/utils.module';
import { ReviewModule } from '../reviews/review.module';
import { CategoryService, CourseService, FavoriteService, SubjectService, TopicService } from '../shared/services';
import { CategoryResolver } from '../shared/resolver';
import { SectionService } from '../shared/services/section.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LectureModalComponent } from './lecture-modal/lecture-modal.component';
import { MyCourseService } from '../shared/services/my-course.service';
import { TranslateModule } from '@ngx-translate/core';
import { LectureMediaService } from '../shared/services/lecture-media.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MediaModule } from '../media/media.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    CourseRoutingModule,
    UtilsModule,
    ReviewModule,
    NgxExtendedPdfViewerModule,
    TranslateModule.forChild(),
    NgSelectModule,
    MediaModule
  ],
  declarations: [CourseListComponent, CourseDetailComponent, CardCourseComponent, LectureModalComponent],
  providers: [
    CourseService,
    CategoryService,
    CategoryResolver,
    FavoriteService,
    SectionService,
    MyCourseService,
    GradeService,
    SubjectService,
    TopicService,
    LectureMediaService,
    PaymentService
  ],
  entryComponents: [],
  exports: [CardCourseComponent]
})
export class CourseModule {}
