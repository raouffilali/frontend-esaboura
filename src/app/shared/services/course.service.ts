import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';

@Injectable()
export class CourseService {
  public courses: any = null;
  private _getCourses: any;
  constructor(private restangular: Restangular) {}

  getCourses(params: any): Promise<any> {
    if (this.courses) {
      return Promise.resolve(this.courses);
    }

    if (this._getCourses && typeof this._getCourses.then === 'function') {
      return this._getCourses;
    }

    this._getCourses = this.restangular
      .one('courses')
      .get(params)
      .toPromise()
      .then(resp => {
        this.courses = resp;
        return this.courses;
      });
    return this._getCourses;
  }
  create(params: any): Promise<any> {
    return this.restangular.all('courses').post(params).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('courses').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('courses', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('courses', id).customPUT(data).toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('courses', id).customDELETE().toPromise();
  }

  checkBooked(courseId: String, targetType: String): Promise<any> {
    return this.restangular.one(`enroll/${courseId}/${targetType}/booked`).post().toPromise();
  }

  enroll(params: any): Promise<any> {
    return this.restangular.all('enroll').post(params).toPromise();
  }

  gift(params: any): Promise<any> {
    return this.restangular.all('gift').post(params).toPromise();
  }

  checkUsedCoupon(id: string): Promise<any> {
    return this.restangular.one('coupons/check-used-coupon', id).get().toPromise();
  }

  applyCoupon(params): Promise<any> {
    return this.restangular.one('coupon/apply-coupon').get(params).toPromise();
  }

  getTransactions(tutorId: string, params: any): Promise<any> {
    return this.restangular.one(`courses/${tutorId}/transaction`).get(params).toPromise();
  }

  getEnrolledList(id: string): Promise<any> {
    return this.restangular.one(`courses/${id}/enrolled`).get().toPromise();
  }
}
