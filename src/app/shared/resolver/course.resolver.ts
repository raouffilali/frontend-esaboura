import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { CourseService } from '../services';

@Injectable()
export class CourseResolver implements Resolve<Observable<any>> {
  constructor(private service: CourseService) {}

  resolve(): any {
    return this.service
      .getCourses({ take: 10, sort: 'createdAt', sortType: 'asc', approved: true, disabled: false })
      .then(resp => resp.data.items);
  }
}
