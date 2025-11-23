import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
@Component({
  templateUrl: './dashboard.component.html'
})
export class DashboardLayoutComponent implements OnInit {
  public noShowMenu: boolean = false;
  constructor(public router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap(route => {
          return route.data;
        }),
        tap(paramMap => paramMap)
      )
      .subscribe(
        paramAsMap => {
          this.noShowMenu = paramAsMap.noShowMenu ? true : false;
        }
        // Get the params (paramAsMap.params) and use them to highlight or everything that meet your need
      );
  }

  ngOnInit() {}
}
