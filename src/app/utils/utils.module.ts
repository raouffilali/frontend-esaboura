import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MediaModule } from '../media/media.module';
import { DefaultImagePipe, EllipsisPipe } from './pipes';
import { AuthService, SubjectService, PostService, CouponService } from '../shared/services';
import { NewsletterService } from './services/newsletter.service';
import { SubjectsResolver, PostsResolver } from '../shared/resolver';
import {
  UserLeftMenuComponent,
  SidebarComponent,
  FooterComponent,
  HeaderComponent,
  BreadcrumbComponent,
  SearchBarComponent,
  DateRangeComponent,
  AppointmentStatusComponent,
  StatusComponent,
  TimezoneComponent,
  ButtonSignupComponent,
  ModalSignupComponent,
  SortComponent,
  NewsleterComponent,
  TableComponent,
  CouponComponent,
  ApplyCouponComponent,
  LectureItemComponent,
  TextEllipsisComponent,
  NgbDateCustomParserFormatter
} from './components';
import { CardTextComponent } from './components/card-text.component';
import { ConversationService } from '../message/services/conversation.service';
import { MessageService } from '../message/services/message.service';
import { WelcomePopupComponent } from './components/welcome-popup.component';
@NgModule({
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    NgbModule,
    TranslateModule.forChild(),
    NgSelectModule,
    MediaModule
  ],
  declarations: [
    BreadcrumbComponent,
    SidebarComponent,
    FooterComponent,
    HeaderComponent,
    UserLeftMenuComponent,
    NewsleterComponent,
    DefaultImagePipe,
    SearchBarComponent,
    DateRangeComponent,
    ButtonSignupComponent,
    ModalSignupComponent,
    AppointmentStatusComponent,
    StatusComponent,
    EllipsisPipe,
    SortComponent,
    TimezoneComponent,
    TableComponent,
    CouponComponent,
    ApplyCouponComponent,
    LectureItemComponent,
    CardTextComponent,
    TextEllipsisComponent,
    WelcomePopupComponent
  ],
  exports: [
    BreadcrumbComponent,
    SidebarComponent,
    FooterComponent,
    HeaderComponent,
    UserLeftMenuComponent,
    NewsleterComponent,
    DefaultImagePipe,
    TranslateModule,
    SearchBarComponent,
    DateRangeComponent,
    ButtonSignupComponent,
    ModalSignupComponent,
    AppointmentStatusComponent,
    StatusComponent,
    EllipsisPipe,
    SortComponent,
    TimezoneComponent,
    TableComponent,
    CouponComponent,
    ApplyCouponComponent,
    LectureItemComponent,
    CardTextComponent,
    TextEllipsisComponent,
    WelcomePopupComponent
  ],
  providers: [
    AuthService,
    SubjectService,
    PostService,
    NewsletterService,
    SubjectsResolver,
    PostsResolver,
    CouponService,
    ConversationService,
    MessageService,
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  entryComponents: [ModalSignupComponent, WelcomePopupComponent]
})
export class UtilsModule {}
