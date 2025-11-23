import { WebinarService } from '../../webinar/webinar.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class WebinarResolver implements Resolve<Observable<any>> {
  constructor(private service: WebinarService) {}

  resolve(): any {
    return this.service
      .search({ take: 10, sort: 'createdAt', sortType: 'asc', isOpen: true, isAvailable: true, disabled: false })
      .then(resp => resp.data.items);
  }
}
