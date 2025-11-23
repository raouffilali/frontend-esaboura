import { SystemService } from './../../shared/services/system.service';
import { ICategory } from './../../categories/interface';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ICourse } from '../interface';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-card-course',
  templateUrl: './card-course.html'
})
export class CardCourseComponent implements OnInit {
  @Input() course: ICourse;

  public category: ICategory;
  public categories: string = '';
  public searchFields: any = {
    categoryIds: ''
  };
  public config: any;
  public rtl: boolean = false;
  public langChange: Subscription;

  constructor(private router: Router, private route: ActivatedRoute, private systemService: SystemService) {
    this.config = this.route.snapshot.data['appConfig'];
    this.langChange = this.systemService.languageChanged$.subscribe(language => {
      this.rtl = this.systemService.checkRTL();
    });
  }

  ngOnInit() {
    this.rtl = this.systemService.checkRTL();
    if (this.course) {
      if (this.course.categories && this.course.categories.length > 0) {
        this.category = this.course.categories[0];
        this.course.categories.forEach(cat => {
          this.categories = this.categories + cat.name + ', ';
        });
        this.categories = this.categories.slice(0, -2);
      }
    }
  }

  clickCategory(catId: any) {
    let categoryIds = [];
    categoryIds.push(catId);
    this.searchFields.categoryIds = categoryIds.join(',');
    this.router.navigate(['/categories'], {
      queryParams: { categoryIds: this.searchFields.categoryIds }
    });
  }
}
