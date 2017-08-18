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
  saveUninitialized: true
}));

app.use('/', (req, res, next) => {
if (!req.session.word){
  let random = Math.floor((Math.random()*(words.length-1)));
  req.session.word = words.filter(word => word.length > 3)[random];
  req.session.word.split('');
  req.session.hiddenLetter = Array(req.session.word.length).fill('_');
  req.session.guessesLeft = [];
  }
next();
});

//.join
//.fill



app.get('/', (req, res) => {
  console.log(req.session.word);
  console.log(req.session.hiddenLetter);
  console.log(req.session.guessesLeft);
  res.render('index', {hiddenLetterArray: req.session.hiddenLetter});
});



app.post('/guess', (req, res) => {
  console.log(req.body.value);
  console.log(Boolean(req.session.word.includes(req.body.value)));
  if (req.session.word.includes(req.body.value)){
  req.session.word.forEach(function(letter){
  if (letter == req.body.value){
    let guessIndex = req.session.word.findIndex(req.body.value);
    req.session.word.splice(guessIndex, 1);
    req.session.hiddenLetter.fill(req.body.value, guessIndex, guessIndex + 1);
      };
    });
    res.redirect('/');
  }else{
    req.session.guessesLeft.push('strike');
    res.redirect('/');
  };
});





app.listen(3000);
