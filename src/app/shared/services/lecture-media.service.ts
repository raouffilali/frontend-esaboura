import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';

@Injectable()
export class LectureMediaService {
  constructor(private restangular: Restangular) {}
  create(params: any): Promise<any> {
    return this.restangular.all('lecture-medias').post(params).toPromise();
  }

  search(params: any): Promise<any> {
    return this.restangular.one('lecture-medias').get(params).toPromise();
  }

  findOne(id): Promise<any> {
    return this.restangular.one('lecture-medias', id).get().toPromise();
  }

  update(id, data): Promise<any> {
    return this.restangular.one('lecture-medias', id).customPUT(data).toPromise();
  }

  delete(id): Promise<any> {
    return this.restangular.one('lecture-medias', id).customDELETE().toPromise();
  }
}
