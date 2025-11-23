import { Injectable } from '@angular/core';
import { RestangularModule, Restangular } from 'ngx-restangular';

@Injectable()
export class PaymentService {
  constructor(private restangular: Restangular) {}

  sendToken(token: string): Promise<any> {
    return this.restangular.one('transactions/token', token).customPOST().toPromise();
  }
  enroll(params: any): Promise<any> {
    return this.restangular.all('enroll').post(params).toPromise();
  }
  //  Added By Ana To Add SlickPay Service
  //  Ajouter au backend route to confirmCardPayment

  confirmCardPayment(params: any): Promise<any> {
    return this.restangular.all('confirmCardPayment').post(params).toPromise();
  }
  // Pour SATIM
    confirmCardPaymentSatim(params: any): Promise<any> {
    return this.restangular.all('confirmCardPaymentSatim').post(params).toPromise();
  }
  

  successCardPayment(params: any): Promise<any> {
    return this.restangular.all('successCardPayment').get(params).toPromise();
  }
// Pour SATIM
  successCardPaymentSatim(params: any): Promise<any> {
    return this.restangular.all('successCardPaymentSatim').get(params).toPromise();
  }

  updateTransaction(orderId: string): Promise<any> {
    return this.restangular.one('transactions/update', orderId).customPOST().toPromise();
  }
  updateSatimTransaction(satimSuccessOrderId: string): Promise<any> {
    return this.restangular.one('transactions/update/success', satimSuccessOrderId).customPOST().toPromise();
  }
  updateSatimFailedTransaction(satimFailOrderId: string): Promise<any> {
    return this.restangular.one('transactions/update/fail', satimFailOrderId).customPOST().toPromise();
  }
  satimRefundTransaction(refundTrId: string): Promise<any> {
    return this.restangular.one('transactions/update/refund', refundTrId).customPOST().toPromise();
  }
}
//  Added By Ana To Add SlickPay Service
//  Ajouter au backend route to confirmCardPayment
// export class SlickpayService {
//   constructor(private restangular: Restangular) {}
//   confirmCardPayment(params: any): Promise<any> {
//     return this.restangular.all('confirmCardPayment').post(params).toPromise();
//   }
// }
