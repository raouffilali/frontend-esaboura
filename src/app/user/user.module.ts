import { LectureMediaService } from './../shared/services/lecture-media.service';
import { AnswerService } from './../shared/services/answer.service';
import { QuestionService } from './../shared/services/question.service';
import { MyCertificateComponent } from './component/my-certificate-modal/my-certificate.component';
import { CountryService } from './../shared/services/country.service';
import { MySubjectService } from './../shared/services/my-subject.service';
import { LectureService } from './../shared/services/lecture.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserRoutingModule } from './user.routing';

import { MediaModule } from '../media/media.module';
import { UtilsModule } from '../utils/utils.module';
import { CalendarModule } from '../calendar/calendar.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReviewModule } from '../reviews/review.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import {
  ProfileUpdateComponent,
  DashboardComponent,
  TutorGradeComponent,
  WebinarCreateComponent,
  WebinarUpdateComponent,
  WebinarListingComponent,
  ListScheduleComponent,
  ScheduleDetailComponent,
  ScheduleComponent,
  ListLessonComponent,
  LessonDetailComponent,
  FavoriteComponent,
  CourseCreateComponent,
  CourseListingComponent,
  CourseUpdateComponent,
  CourseCouponComponent,
  CourseGoalComponent,
  CourseLetureComponent,
  SectionFormComponent,
  LectureFormComponent,
  ListCourseComponent,
  MyCourseDetailComponent,
  CourseTransactionListComponent,
  CourseTransactionDetailComponent,
  MyCategoriesComponent,
  MyCategoryFormComponent,
  MySubjectFormComponent,
  MyTopicFormComponent,
  ModalAppointment
} from './component';
import {
  WebinarService,
  CategoryService,
  AppointmentService,
  FavoriteService,
  CourseService,
  SectionService,
  MyCategoryService,
  MyTopicService,
  TopicService,
  SubjectService
} from '../shared/services';
import { UserService } from './services/user.service';
import { TutorService } from '../tutor/services/tutor.service';
import { RequestRefundService } from '../refund/services/request-refund.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { GradeService } from '../tutor/services/grade.service';
import { CalendarService } from '../calendar/services/calendar.service';
import { TranslateModule } from '@ngx-translate/core';
import { TutorModule } from '../tutor/tutor.module';
import { WebinarModule } from '../webinar/webinar.module';
import { MyCourseService } from '../shared/services/my-course.service';
import { CategoryResolver, ConfigResolver } from '../shared/resolver';
import { TransactionService } from '../transactions/services/transaction.service';
import { CourseModule } from '../course/course.module';
import { QuillModule } from 'ngx-quill';
import { ParticipantFormComponent } from './component/webinar/modal-participants/participants-form';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { MessageModule } from '../message/message.module';
import { RecurringForm } from './component/schedule/recurring-schedule/modal-recurring/modal-recurring.component';
import { ListRecurringScheduleComponent } from './component/schedule/recurring-schedule/list-recurring.component';
import { MediaService } from '../media/service';
import { CurrentUserResolver } from '../shared/resolver/current-user.resolver';
import { CourseQAComponent } from './component/course/course-QA/QA.component';
import { QuestionFormComponent } from './component/course/modal-question/question-form';
import { QAModalComponent } from './component/my-course/mycourse-QA/qa.modal';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReferredListComponent } from './component/referred/referred.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // our custom module
    UserRoutingModule,
    NgbModule,
    MediaModule,
    UtilsModule,
    NgSelectModule,
    CalendarModule,
    ReviewModule,
    TooltipModule.forRoot(),
    CKEditorModule,
    TranslateModule.forChild(),
    TutorModule,
    WebinarModule,
    NgxExtendedPdfViewerModule,
    CourseModule,
    QuillModule.forRoot(),
    ShareButtonModule,
    ShareIconsModule,
    MessageModule,
    ClipboardModule
  ],
  declarations: [
    ProfileUpdateComponent,
    DashboardComponent,
    TutorGradeComponent,
    WebinarCreateComponent,
    WebinarUpdateComponent,
    WebinarListingComponent,
    ListScheduleComponent,
    ScheduleDetailComponent,
    ScheduleComponent,
    ListLessonComponent,
    LessonDetailComponent,
    FavoriteComponent,
    CourseCreateComponent,
    CourseListingComponent,
    CourseUpdateComponent,
    CourseCouponComponent,
    CourseGoalComponent,
    CourseLetureComponent,
    SectionFormComponent,
    LectureFormComponent,
    ListCourseComponent,
    MyCourseDetailComponent,
    CourseTransactionListComponent,
    CourseTransactionDetailComponent,
    ParticipantFormComponent,
    MySubjectFormComponent,
    MyCategoriesComponent,
    MyCategoryFormComponent,
    MyTopicFormComponent,
    MyCertificateComponent,
    ModalAppointment,
    RecurringForm,
    ListRecurringScheduleComponent,
    CourseQAComponent,
    QuestionFormComponent,
    QAModalComponent,
    ReferredListComponent
  ],
  providers: [
    UserService,
    TutorService,
    TutorGradeComponent,
    GradeService,
    WebinarService,
    CategoryService,
    RequestRefundService,
    AppointmentService,
    CalendarService,
    FavoriteService,
    CourseService,
    SectionService,
    LectureService,
    MyCourseService,
    CategoryResolver,
    TransactionService,
    ConfigResolver,
    CountryService,
    GradeService,
    MySubjectService,
    MyCategoryService,
    MyTopicService,
    TopicService,
    SubjectService,
    LectureMediaService,
    MediaService,
    CurrentUserResolver,
    QuestionService,
    AnswerService
  ],
  exports: [RecurringForm],
  entryComponents: [ParticipantFormComponent, RecurringForm]
})
export class UserModule {}
