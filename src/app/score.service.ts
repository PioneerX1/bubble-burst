import { Injectable } from '@angular/core';
import { Score } from './score.model';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Injectable()
export class ScoreService {

  scores: FirebaseListObservable<any[]>;

  constructor(private database: AngularFireDatabase) {
    this.scores = database.list('scores');
  }

  getScores() {
    return this.scores;
  }

}
