import { TranslateService } from '@ngx-translate/core';
import { AnswerService } from './../../../../shared/services/answer.service';
import { QuestionService } from './../../../../shared/services/question.service';
import { IAnswer } from './../../../../course/interface';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { IQuestion } from '../../../../course/interface';
import { pick } from 'lodash';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.html'
})
export class QuestionFormComponent implements OnInit {
  @Input() question: IQuestion = {};
  @Input() courseId: string;
  public submitted: boolean = false;
  public answerSubmitted: boolean = false;
  public updatingQuestion: IQuestion = {
    type: 'single',
    isTrue: true,
    content: ''
  };

  public indexAnswer: number;
  public answers: IAnswer[] = [];
  public answer: IAnswer = {
    content: '',
    label: '',
    isCorrect: true,
    matchingAnswerId: null,
    isColumnA: true,
    type: '',
    matchingLabel: ''
  };

  public labels: string[] = [];
  public updatingLabel: string;
  public columnAAnswers: IAnswer[] = [];
  public columnBAnswers: IAnswer[] = [];

  constructor(
    private toasty: ToastrService,
    public activeModal: NgbActiveModal,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (!this.question._id)
      this.question = {
        type: 'single',
        isTrue: true,
        content: ''
      };
    else {
      this.updatingQuestion = Object.assign({}, this.question);
      this.queryAnswers();
    }
  }

  queryAnswers() {
    this.labels = [];
    this.columnAAnswers = [];
    this.columnBAnswers = [];
    this.answerService
      .search({ questionId: this.question._id })
      .then(resp => {
        this.answers = resp.data.items;
        if (this.question.type === 'matching') {
          this.answers.map(item => {
            this.labels.push(item.label);
            if (item.isColumnA) this.columnAAnswers.push(item);
            else this.columnBAnswers.push(item);
          });
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
      });
  }

  submitQuestion(frmQuestion: any) {
    this.submitted = true;
    if (this.updatingQuestion.type === 'trueOrFalse' && this.updatingQuestion.isTrue === null)
      return this.toasty.error(this.translate.instant('Please check the correct answer!'));
    if (!frmQuestion.valid || this.updatingQuestion.ordering < 0) {
      return this.toasty.error(this.translate.instant('Please complete the required fields for the question!'));
    }
    if (!this.question._id) {
      this.questionService
        .create(Object.assign(this.updatingQuestion, { courseId: this.courseId }))
        .then(resp => {
          if (resp.data) {
            this.question = resp.data;
            this.updatingQuestion = resp.data;
            this.toasty.success(this.translate.instant('Created successfully!'));
            if (this.question.type === 'trueOrFalse') {
              this.activeModal.close(pick(this.question, ['_id', 'content', 'type', 'ordering', 'isTrue']));
            }
            this.submitted = false;
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
          this.submitted = false;
        });
    } else {
      {
        this.questionService
          .update(this.question._id, pick(this.updatingQuestion, ['courseId', 'content', 'isTrue', 'type', 'ordering']))
          .then(resp => {
            if (resp.data) {
              this.question = resp.data;
              this.updatingQuestion = resp.data;
              this.toasty.success(this.translate.instant('Updated successfully!'));
              if (this.question.type === 'trueOrFalse') {
                this.activeModal.close(pick(this.question, ['_id', 'content', 'type', 'ordering', 'isTrue']));
              }
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
          });
      }
    }

    this.submitted = false;
  }

  submitAnswer(frmAnswer: any) {
    this.answerSubmitted = true;
    if (!frmAnswer.valid) {
      return this.toasty.error(this.translate.instant('Please complete the required fields for the answer!'));
    }
    if (!this.answer._id) {
      if (this.question.type === 'matching' && this.labels.includes(this.answer.label)) {
        return this.toasty.error(this.translate.instant('The answer label is duplicated!'));
      }
      this.answerService
        .create(Object.assign(this.answer, { type: this.question.type, questionId: this.question._id }))
        .then(resp => {
          this.answer = resp.data;
          if (this.question.type === 'single' && this.answer.isCorrect === true) {
            this.resetAllAnswer();
          }
          if (this.question.type === 'matching') {
            if (this.answer.isColumnA) this.columnAAnswers.push(this.answer);
            else this.columnBAnswers.push(this.answer);
          }
          this.answers.push(this.answer);
          this.toasty.success(this.translate.instant('Add successfully!'));
          this.resetAnswer();
          this.answerSubmitted = false;
        })
        .catch(err => {
          this.answerSubmitted = false;
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
        });
    } else {
      if (this.question.type === 'matching') {
        if (this.answer.label !== this.updatingLabel) {
          if (this.labels.includes(this.answer.label))
            return this.toasty.error(this.translate.instant('The answer label is duplicated!'));
        }
      }
      this.answerService
        .update(
          this.answer._id,
          pick(this.answer, ['content', 'isCorrect', 'label', 'questionId', 'matchingAnswerId', 'type', 'isColumnA'])
        )
        .then(resp => {
          if (this.question.type === 'single' && resp.data.isCorrect === true) this.resetAllAnswer();
          if (this.question.type === 'matching') {
            this.queryAnswers();
          }

          this.answers[this.indexAnswer] = resp.data;
          this.toasty.success(this.translate.instant('Update successfully!'));
          this.resetAnswer();
          this.answerSubmitted = false;
        })
        .catch(err => {
          this.answerSubmitted = false;
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
        });
    }
    this.answerSubmitted = false;
  }

  updateAnswer(answer, i) {
    if (answer.label) {
      this.updatingLabel = answer.label;
    }
    this.answer = Object.assign({}, answer);
    this.indexAnswer = i;
  }

  removeAnswer(answer, i) {
    if (window.confirm(this.translate.instant('Are you sure want to remove this answer?'))) {
      this.answerService
        .delete(answer._id)
        .then(() => {
          this.queryAnswers();
          this.resetAnswer();
        })
        .catch(e => this.toasty.error(this.translate.instant(e.data.data.message)));
    }
  }

  resetAnswer() {
    this.answer = {
      content: '',
      label: '',
      isCorrect: true,
      matchingAnswerId: null,
      isColumnA: false,
      type: ''
    };
    if (this.indexAnswer && this.answer._id) this.answers[this.indexAnswer] = this.answer;
  }

  checkAnswer(answer) {
    if (!answer.isCorrect) {
      answer.isCorrect = true;
      this.answerService
        .update(
          answer._id,
          pick(answer, ['content', 'isCorrect', 'label', 'questionId', 'matchingAnswerId', 'type', 'isColumnA'])
        )
        .then(resp => {
          if (this.question.type === 'single') this.resetAllAnswer();
          answer.isCorrect = true;
          this.toasty.success(this.translate.instant('Update successfully!'));
        })
        .catch(err => {
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
        });
    }
  }

  resetAllAnswer() {
    this.answers.map(item => (item.isCorrect = false));
  }

  saveMatching() {
    let failed = false;
    this.columnAAnswers.map(item => {
      if (!item.matchingAnswerId) {
        failed = true;
        return this.toasty.error(this.translate.instant('Please select matching label for all answers!'));
      }
      this.answerService
        .update(
          item._id,
          pick(item, ['content', 'isCorrect', 'label', 'questionId', 'matchingAnswerId', 'type', 'isColumnA'])
        )
        .then()
        .catch(err => {
          this.toasty.error(
            this.translate.instant(
              err.data && err.data.data && err.data.data.message
                ? err.data.data.message
                : 'Something went wrong, please try again!'
            )
          );
        });
    });
    if (!failed) this.toasty.success(this.translate.instant('Save successfully!'));
  }

  done() {
    let failed = false;
    if (this.question.type === 'matching') {
      if (!this.columnAAnswers.length || !this.columnBAnswers.length) {
        return this.toasty.error(this.translate.instant('Please add answers for both columns!'));
      }
      this.columnAAnswers.map(item => {
        if (!item.matchingAnswerId) {
          failed = true;
          return this.toasty.error(this.translate.instant('Please select matching label for all answers!'));
        }
      });
    }
    if (this.question.type !== 'trueOrFalse' && !this.answers.length) {
      return this.toasty.error(this.translate.instant('Please add answers for the question!'));
    }
    if (!failed) this.activeModal.close(pick(this.question, ['_id', 'content', 'type', 'ordering', 'isTrue']));
  }
}
