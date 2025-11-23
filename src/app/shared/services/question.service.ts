import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Injectable()
export class QuestionService {
  constructor(private restangular: Restangular) {}
  create(params: any): Promise<any> {
    return this.restangular.all('questions').post(params).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('questions').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('questions', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('questions', id).customPUT(data).toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('questions', id).customDELETE().toPromise();
  }
}
