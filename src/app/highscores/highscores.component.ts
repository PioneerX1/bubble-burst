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

  scores;
  newScores: Score[] = [];
  orderedScores: Score[] = [];

  constructor(private scoreService: ScoreService) { }

  ngOnInit() {
    this.scores = this.scoreService.getScores().subscribe(scores => {
      scores.forEach(score => {
        console.log(score.name + " " + score.points);
        let newScore = new Score(score.name, score.points);
        console.log(newScore.name + " " + newScore.points);
        this.newScores.push(newScore);
      });
      console.log(this.newScores.toString());
      // this.newScores = this.newScores.sort();
      // this.newScores = _.sortBy(this.newScores, 'points');
      this.orderedScores = this.newScores.sort(function(obj1, obj2) {
        return obj1.points - obj2.points;
      });
      this.orderedScores = this.orderedScores.reverse();
    });
  }


  submitNewScore(name, points) {
    var newScore: Score = new Score(name, points);
    this.scoreService.addScore(newScore);
    window.location.reload();
  }



}
