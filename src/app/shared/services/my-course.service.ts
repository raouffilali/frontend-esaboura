import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';

@Injectable()
export class MyCourseService {
  constructor(private restangular: Restangular) {}

  search(params: any): Promise<any> {
    return this.restangular.one('my-courses').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('my-courses', id).get().toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('my-courses', id).customDELETE().toPromise();
  }

  getSections(id): Promise<any> {
    return this.restangular.one('my-courses', id).one('sections').get().toPromise();
  }

  updateProgress(id, params): Promise<any> {
    return this.restangular.one(`my-courses/${id}/update-progress`).customPUT(params).toPromise();
  }

  complete(id):Promise<any> {
    return this.restangular.one(`my-courses/${id}/complete`).customPUT().toPromise();
  }
}
