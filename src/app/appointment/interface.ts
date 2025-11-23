export interface IBooking {
  _id?: string;
  startTime?: string;
  toTime?: string;
  tutorId?: string;
  subjectId?: string;
  isFree?: boolean;
  stripeToken?: string;
  couponCode?: string;
  targetId?: string;
  displayStartTime?: string;
  displayToTime?: string;
  payMethod?: 'stripe' | 'paypal' | 'bonus-class';
}
