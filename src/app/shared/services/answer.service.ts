import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Injectable()
export class AnswerService {
  constructor(private restangular: Restangular) {}
  create(params: any): Promise<any> {
    return this.restangular.all('answers').post(params).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('answers').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('answers', id).get().toPromise();
  }

  checkCorrect(id): Promise<any> {
    return this.restangular.one('answers', id).one('check').get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('answers', id).customPUT(data).toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('answers', id).customDELETE().toPromise();
  }
}
