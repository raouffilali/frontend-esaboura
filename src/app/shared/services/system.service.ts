import { Injectable } from '@angular/core';
import { Restangular } from 'ngx-restangular';

import * as _ from 'lodash';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  public appConfig: any = null;

  private _getConfig: any;
  private languageChanged = new Subject<any>();
  public languageChanged$ = this.languageChanged.asObservable();
  constructor(private restangular: Restangular) {}

  configs(): Promise<any> {
    if (this.appConfig) {
      if (localStorage.getItem('userLang')) {
        this.appConfig = Object.assign(this.appConfig, { userLang: localStorage.getItem('userLang') });
      }
      return Promise.resolve(this.appConfig);
    }

    if (this._getConfig && typeof this._getConfig.then === 'function') {
      return this._getConfig;
    }

    this._getConfig = this.restangular
      .one('system/configs/public')
      .get()
      .toPromise()
      .then(resp => {
        this.appConfig = resp.data;

        // this.languageChanged.next(localStorage.getItem('userLang'));
        return this.appConfig;
      });

    return this._getConfig;
  }

  setUserLang(lang: string) {
    localStorage.setItem('userLang', lang);
    if (lang === 'ar' || lang === 'he') {
      localStorage.setItem('rtl', 'yes');
    } else {
      localStorage.setItem('rtl', 'no');
    }
    this.languageChanged.next(lang);
  }

  checkRTL() {
    return localStorage.getItem('rtl') === 'yes';
  }
}
