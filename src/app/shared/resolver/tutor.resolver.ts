import { TutorService } from './../../tutor/services/tutor.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class TutorResolver implements Resolve<Observable<any>> {
  constructor(private service: TutorService) {}

  resolve(): any {
    return this.service
      .search({ take: 10, sort: 'createdAt', sortType: 'asc', isHomePage: true, isActive: true })
      .then(resp => resp.data.items);
  }
}
