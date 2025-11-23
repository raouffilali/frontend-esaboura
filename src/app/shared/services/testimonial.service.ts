import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class TestimonialService {
  public testimonials: any = null;
  private _getTestimonials: any;
  constructor(private restangular: Restangular) {}

  getTestimonials(params: any): Promise<any> {
    if (this.testimonials) {
      return Promise.resolve(this.testimonials);
    }

    if (this._getTestimonials && typeof this._getTestimonials.then === 'function') {
      return this._getTestimonials;
    }

    this._getTestimonials = this.restangular
      .one('testimonials')
      .get(params)
      .toPromise()
      .then(resp => {
        this.testimonials = resp;
        return this.testimonials;
      });
    return this._getTestimonials;
  }

  search(params: any): Promise<any> {
    return this.restangular.one('testimonials').get(params).toPromise();
  }
}
