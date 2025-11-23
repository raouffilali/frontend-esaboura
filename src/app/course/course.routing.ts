import { ConfigResolver } from './../shared/resolver/config.resolver';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CourseListComponent } from './list/list.component';
import { CourseDetailComponent } from './detail/detail.component';
import { CategoryResolver } from '../shared/resolver';

const routes: Routes = [
  {
    path: 'list',
    component: CourseListComponent,
    data: {
      title: 'Webinars manager',
      urls: [{ title: 'Courses', url: '/courses/list' }, { title: 'Listing' }]
    },
    resolve: {
      categories: CategoryResolver,
      appConfig: ConfigResolver
    }
  },
  {
    path: 'detail/:id',
    component: CourseDetailComponent,
    resolve: {
      appConfig: ConfigResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseRoutingModule {}
