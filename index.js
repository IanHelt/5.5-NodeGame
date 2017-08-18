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
app.use(bodyParser.urlencoded({extended: false}))
app.use(expressValidator());
app.use(morgan('combined'));
app.use(session({
  secret: "chimp",
  resave: false,
  saveUninitialized: true,
}));

app.use('/', (req, res, next) => {
if (!req.session.word){
  let random = Math.floor((Math.random()*(words.length-1)));
  req.session.word = words.filter(word => word.length > 3)[random].split('');
  req.session.hiddenLetter = Array(req.session.word.length).fill('_');
  req.session.guessesLeft = [];
  }
next();
});

app.get('/', (req, res) => {
  let winCheckA = req.session.hiddenLetter.join('');
  let winCheckB = req.session.word.join('');
  let loseCheck = req.session.guessesLeft.length;
  if(loseCheck == '5'){
    res.render('lose', {fullWord: winCheckB});
  }
  else if(winCheckA === winCheckB){
    res.render('win');
  };
  console.log(req.session);
  console.log(req.session.word);
  console.log(req.session.hiddenLetter);
  console.log(req.session.guessesLeft);
  res.render('index', {hiddenLetterArray: req.session.hiddenLetter, incorrectGuesses: req.session.guessesLeft});
});

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
    res.redirect('/');
  }else{
    req.session.guessesLeft.push(req.body.guessInput);
    res.redirect('/');
  };
});

app.post('/restart', (req, res) => {

  res.redirect('/');
});




app.listen(3000);
