## Bubble-Burst!

A web app for that honors the Bubble Burst game with an interplanetary theme.

#### By _**Anna Kuznetsova, Anna Timofeyeva, Michael Dunlap, and Mick Sexton**_

### Description

Users can visit the website to learn more about the history of the Bubble Burst game, its creators, to play the game, and view high scores. Game should be played with sound for ultimate effect.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Gulp]
* [Angular.js]
* [Bower]

## Installation

* `git clone <repository-url>` this repository
* `cd bubble-burst`
* `npm install`
* `bower init`
* Install Bootstrap
* `ng serve`
* Navigate to `localhost:4200` in your browser

* OR BETTER YET: Check out the live hosted version at https://bubble-burst-7169a.firebaseapp.com

## Code Specs

|Behavior - Plain English|Input|Output|
|---|---|---|
|User sees the home page.|User clicks About to learn more about the history of the game and its creators.|User goes to About page that lists this info along with group photo and GitHub repo.|
|User is on home page.|User clicks on High Scores.|User gets directed to a list of high score winners by most points (top 20 only).|
|User is on home page.|User clicks on Play Game!|User navigates to the game itself.|
|User is on the game screen.|User clicks an area of the inner screen to hurl a planet at other planets.|Planet flies directly to the spot selected if no other planets in the way.|
|User lines up three or more touching planets together.|Action has just been performed.|This cluster of planets dissappears from screen.|
|5 Turns go by with no cluster clearances.|Program loads another row.|A row is added at the top above all the other rows, pushing the other rows closer to the player's planet slingshot.|

## Known Bugs

_No known bugs or issues at this time._

## Support and contact details

_Please contact Mick Sexton at lacrookedbeat@hotmail.com for any questions, feedback, or concerns._

## Technologies Used

_Technologies used include NPM, Angular, Bower, Node.js, Javascript, Typescript, Firebase, Mars Rover API, Bootstrap, SCSS, SASS, HTML, and Git_

### License

*This software operates under the MIT license.*

Copyright (c) 2017 **_Anna Kuznetsova, Anna Timofeyeva, Michael Dunlap, and Mick Sexton_**

### Additional Angular-Specific Documentation

# BubbleBurst

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Deployment Link
https://bubble-burst-7169a.firebaseapp.com

###API Key for Firebase

* Touch and `src/app/api-keys.ts` file and add the following

```
export const marsRoverKey = "YFcL2M7cMBQ8j1VRQTyCO1ejj1SDqgY3k2FJWdxc"
export var masterFirebaseConfig = {
  apiKey: "AIzaSyDrUl4_IAzL_Xv3KGHo3wnir7x3RF_A8qo",
  authDomain: "bubble-burst-7169a.firebaseapp.com",
  databaseURL: "https://bubble-burst-7169a.firebaseio.com",
  projectId: "bubble-burst-7169a",
  storageBucket: "",
  messagingSenderId: "833237462114"
}
```
