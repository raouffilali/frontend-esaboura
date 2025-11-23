import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { UtilsModule } from '../utils/utils.module';
import { StarterComponent } from './starter.component';
import { WebinarModule } from '../webinar/webinar.module';

import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CategoryService, WebinarService, TestimonialService, CourseService } from '../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReviewModule } from '../reviews/review.module';
import { TranslateModule } from '@ngx-translate/core';
import { TutorService } from '../tutor/services/tutor.service';
import { CourseModule } from '../course/course.module';
import { ConfigResolver } from '../shared/resolver';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Started',
      urls: [{ title: 'Started', url: '/starter' }, { title: 'Started' }]
    },
    component: StarterComponent,
    pathMatch: 'full'
  },
  {
    path: 'home',
    data: {
      title: 'Started',
      urls: [{ title: 'Started', url: '/starter' }, { title: 'Started' }]
    },
    component: StarterComponent,
    pathMatch: 'full',
    resolve: {
      appConfig: ConfigResolver
    }
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SlickCarouselModule,
    UtilsModule,
    WebinarModule,
    NgbModule,
    ReviewModule,
    CourseModule,
    TranslateModule.forChild()
    // TutorModule
  ],
  declarations: [StarterComponent],
  providers: [CategoryService, WebinarService, TutorService, TestimonialService, CourseService]
})
export class StarterModule {}
