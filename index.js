const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const expressValidator = require('express-validator');
const session = require('express-session');
const fs = require('fs');
const app = express();
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(morgan('combined'));
app.use(session({
  secret: "chimp",
  resave: false,
  saveUninitialized: true,
}));

/* Checks if the word array exists and creates new variables in the session
cookie if it is not found */

app.use('/', (req, res, next) => {
if (!req.session.word){
  let random = Math.floor((Math.random()*(words.length-1)));
  let randomWord = words.filter(word => word.length > 3)[random].split('');
  req.session.word = randomWord;
  req.session.hiddenLetter = Array(req.session.word.length).fill('_');
  req.session.guessesLeft = [];
  }
next();
});

/* Creates the index, win, or lose pages based on conditions met by
  if/else statements */

app.get('/', (req, res) => {
  let winCheckA = req.session.hiddenLetter.join('');
  let winCheckB = req.session.word.join('');
  let loseCheck = req.session.guessesLeft.length;
  if(loseCheck == '5'){
  return res.render('lose', {winCheckB:winCheckB});
  }
  else if(winCheckA === winCheckB && winCheckB != []){
  return res.render('win', {winCheckB:winCheckB});
  };
  console.log(req.session);
  console.log(req.session.word);
  console.log(req.session.hiddenLetter);
  console.log(req.session.guessesLeft);
  res.render('index', {hiddenLetterArray: req.session.hiddenLetter, incorrectGuesses: req.session.guessesLeft});
});


  /* Posts the value of the letter on the button pushed by the user, then
  checks if the letter exists in session.word.

   If it exists then a for loop is executed that iterates over the content in session.word and replaces
  underscores in session.hiddenLetter based on the index of the guessed letter
  in session.word.

   If it does not exist it pushes the guessed letter to session.guessesLeft,
   which is used to display incorrect user guessesLeft

   If the user tries to input a correct guess they had already previously guessed,
   the page is redirected and nothing is changed */

app.post('/guess', (req, res) => {
  if (req.session.word.includes(req.body.guessInput) == true
  && req.session.hiddenLetter.includes(req.body.guessInput) == false){
  for (var i = 0; i < req.session.word.length; i++){
  if (req.session.word[i] == req.body.guessInput){
    req.session.hiddenLetter.fill(req.body.guessInput, i, i + 1);
    console.log(i);
      };
    };
    res.redirect('/');
  }else if (req.session.hiddenLetter.includes(req.body.guessInput)) {
    return res.redirect('/');
  }else{
    req.session.guessesLeft.push(req.body.guessInput);
    return res.redirect('/');
  };
});

  /* When the reset button is pushed, this generates a new word and splits
   it into an array. The arrays storing data from the previous game are spliced
   in order to make room for the new game. Push.apply is used because it allows
   an array to be pushed into an array, and .push is a valid function argument
   for .apply to use */

app.post('/restart', (req, res) => {
  let random = Math.floor((Math.random()*(words.length-1)));
  let randomWord = words.filter(word => word.length > 3)[random].split('');
  req.session.word.splice(0);
  req.session.hiddenLetter.splice(0);
  req.session.guessesLeft.splice(0);
  req.session.word.push.apply(req.session.word, randomWord);
  req.session.hiddenLetter.push.apply(req.session.hiddenLetter, randomWord);
  req.session.hiddenLetter.fill('_');
  console.log(req.session.word);
  console.log(req.session.hiddenLetter);
  console.log(req.session.guessesLeft);
  return res.redirect('/');
});




app.listen(3000);
