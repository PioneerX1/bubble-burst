import { Component, OnInit } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { Score } from '../score.model';
import { ScoreService } from '../score.service';

@Component({
  selector: 'app-highscores',
  templateUrl: './highscores.component.html',
  styleUrls: ['./highscores.component.css'],
  providers: [ScoreService]
})

export class HighscoresComponent implements OnInit {

  scores: FirebaseListObservable<any[]>;

  constructor(private scoreService: ScoreService) { }

  ngOnInit() {
    this.scores = this.scoreService.getScores();
  }

  submitNewScore(name, points) {
    var newScore: Score = new Score(name, points);
    this.scoreService.addScore(newScore);
  }

}
