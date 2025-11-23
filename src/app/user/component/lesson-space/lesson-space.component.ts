import { Component, OnInit } from '@angular/core';
import { SeoService, AuthService } from '../../../shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../../message/services/socket.service';
import { IUser } from '../../interface';
@Component({
  templateUrl: './iframe.html',
  styleUrls: ['./lesson-page.scss']
})
export class LessonSpaceComponent implements OnInit {
  public tab: 'lesson-space' | 'browser' = 'lesson-space';
  public currentUser: IUser;
  public appointmentId: string;
  constructor(
    private seoService: SeoService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private socket: SocketService,
    private route: ActivatedRoute
  ) {
    seoService.update('My Lesson');
    this.appointmentId = this.route.snapshot.queryParams['appointmentId'];
  }

  async ngOnInit() {
    this.authService.getCurrentUser().then(resp => {
      this.currentUser = resp;
      let stored = localStorage.getItem('lessonSpaceUrl');
      if (stored && stored.indexOf('room.sh') > -1) {
        const iframe = document.getElementById('lessonspace') as HTMLElement;
        iframe.setAttribute('src', stored);
      }
    });
  }

  back() {
    if (this.currentUser && this.currentUser.type === 'tutor') {
      this.router.navigate(['/users/appointments']);
    } else if (this.currentUser && this.currentUser.type === 'student') {
      this.router.navigate(['/users/lessons']);
    }
  }
}
