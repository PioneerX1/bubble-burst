import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';
import { AboutComponent } from './about/about.component';
import { HighscoresComponent } from './highscores/highscores.component';

const appRoutes: Routes = [
  {
    path: '',
    component: WelcomeComponent
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'highscores',
    component: HighscoresComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
