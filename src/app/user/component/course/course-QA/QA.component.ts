import { TranslateService } from '@ngx-translate/core';
import { QuestionService } from './../../../../shared/services/question.service';
import { IAnswer } from './../../../../course/interface';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ICourse, IQuestion } from '../../../../course/interface';
import { QuestionFormComponent } from '../modal-question/question-form';
@Component({
  selector: 'course-QA',
  templateUrl: './QA.html'
})
export class CourseQAComponent implements OnInit {
  @Input() course: ICourse;
  @Input() rtl: boolean = false;
  @Output() onTabSelect = new EventEmitter();
  public courseId: string;
  public isSubmitted: boolean = false;
  public questions: IQuestion[] = [];
  public answers: IAnswer[] = [];
  public loading: boolean = false;
  constructor(
    private toasty: ToastrService,
    private questionService: QuestionService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.courseId = this.course._id;
    this.queryQuestions();
  }

  queryQuestions() {
    if (this.courseId) {
      this.loading = true;
      this.questionService
        .search({ courseId: this.courseId, take: 100, sort: 'ordering', sortType: 'asc' })
        .then(resp => {
          if (resp.data) {
            this.questions = resp.data.items;
            this.loading = false;
          }
        })
        .catch(err => {
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
          this.loading = false;
        });
    }
  }

  onTab(tab: number) {
    this.onTabSelect.emit(tab);
  }

  submitQuestion(question = {} as IQuestion) {
    const modalRef = this.modalService.open(QuestionFormComponent, { centered: true, backdrop: 'static', size: 'xl' });
    modalRef.componentInstance.question = question;
    modalRef.componentInstance.courseId = this.courseId;
    modalRef.result.then(
      res => {
        this.queryQuestions();
      },
      () => {}
    );
  }

  removeQuestion(item: any, index: number) {
    if (window.confirm(this.translate.instant('Are you sure want to remove this question?'))) {
      this.questionService
        .delete(item._id)
        .then(() => {
          this.toasty.success('Item has been deleted!');
          this.questions.splice(index, 1);
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }
}
