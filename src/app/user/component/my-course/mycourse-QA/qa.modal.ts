import { AnswerService } from './../../../../shared/services/answer.service';
import { QuestionService } from './../../../../shared/services/question.service';
import { IAnswer } from './../../../../course/interface';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { IQuestion } from '../../../../course/interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'my-course-QA',
  templateUrl: './qa.modal.html'
})
export class QAModalComponent implements OnInit {
  @Input() courseId: string;
  public isSubmitted: boolean = false;
  public questions: IQuestion[] = [];
  public loading: boolean = false;
  constructor(
    private toasty: ToastrService,
    public activeModal: NgbActiveModal,
    private questionService: QuestionService,
    private answerService: AnswerService
  ) {}

  ngOnInit() {
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
            this.questions.map(item => {
              item.checkedAnswerId = null;
              item.checkedAnswerIds = [];
              item.correct = false;
              item.checking = false;
              item.viewAnswer = false;
            });
            this.loading = false;
          }
        })
        .catch(err => {
          this.toasty.error(
            err.data && err.data.data && err.data.data.message
              ? err.data.data.message
              : 'Something went wrong, please try again!'
          );
          this.loading = false;
        });
    }
  }

  checkAnswer(q: IQuestion, a: IAnswer) {
    if (q.type === 'multi') {
      if (q.checkedAnswerIds.includes(a._id)) {
        const index = q.checkedAnswerIds.indexOf(a._id);
        q.checkedAnswerIds.splice(index, 1);
      } else q.checkedAnswerIds.push(a._id);
    } else if (q.type === 'single' || q.type === 'trueOrFalse') {
      q.checkedAnswerId = a._id;
    }
  }

  submitAnswer(q: IQuestion) {
    if (q.type === 'multi') {
      if (q.checkedAnswerIds.length <= 0) return this.toasty.error('Please select your answers!');
      q.checking = true;
    }
    if (q.type === 'single' || q.type === 'trueOrFalse') {
      if (!q.checkedAnswerId) return this.toasty.error('Please select your answer!');
      q.checking = true;
      this.answerService.checkCorrect(q.checkedAnswerId).then(resp => {
        if (resp.data.isCorrect === true) q.correct = true;
        else q.correct = false;
      });
    }
    if (q.type === 'matching') {
      let failed = false;
      q.columnAAnswers.map(item => {
        if (!item.checkedMatchingAnswerId) {
          failed = true;
          return this.toasty.error('Please match all your answers!');
        }
      });

      if (!failed) {
        q.checking = true;
        q.columnAAnswers.map(item => {
          if (item.checkedMatchingAnswerId === item.matchingAnswerId) {
            item.isCorrect = true;
          } else {
            item.isCorrect = false;
          }
        });
      }
    }
  }
  viewAnswer(q: IQuestion) {
    q.viewAnswer = !q.viewAnswer;
  }
}
