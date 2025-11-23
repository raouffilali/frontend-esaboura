import { IUser, ISubject } from '../user/interface';
import { IWebinar } from '../webinar/interface';
import { ICourse } from '../course/interface';

export interface IRefund {
  _id?: string;
  tutor?: IUser;
  webinar?: IWebinar;
  subject?: ISubject;
  course?: ICourse;
  amount?: number;
  reason?: string;
  createdAt?: string;
  status?: string;
}
