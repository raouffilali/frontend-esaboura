import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { TestimonialService } from '../services';

@Injectable()
export class TestimonialResolver implements Resolve<Observable<any>> {
  constructor(private service: TestimonialService) {}

  resolve(): any {
    return this.service.getTestimonials({ take: 50 }).then(resp => resp.data.items);
  }
}
