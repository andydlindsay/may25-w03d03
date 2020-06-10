const express = require('express');
const morgan = require('morgan');
const languages = require('./languages.json');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');

const app = express();
const port = 8765;
const users = {
  'abcd': {
    id: 'abcd',
    email: 'john@stamos.com',
    password: '1234'
  }
};

// middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
  const userLanguage = req.cookies.language || 'en';
  const templateVars = {
    heading: languages.homeHeadings[userLanguage],
    body: languages.homeBodies[userLanguage]
  };
  res.render('home', templateVars);
});

app.get('/about', (req, res) => {
  const userLanguage = req.cookies.language || 'en';
  const templateVars = {
    heading: languages.aboutHeadings[userLanguage],
    body: languages.aboutBodies[userLanguage]
  };
  res.render('about', templateVars);
});

app.get('/language/:languagePreference', (req, res) => {
  const languagePreference = req.params.languagePreference;
  res.cookie('language', languagePreference);
  res.redirect('/home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/protected', (req, res) => {
  const userId = req.cookies.userId;
  if (userId) {
    const user = users[userId];
    return res.render('protected', { user });
  }
  return res.redirect('/login');
});

app.get('/', (req, res) => {
  res.send('hello');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // search the users database for the user that matches the email
  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  // if no match return an error
  if (!foundUser) {
    return res.status(400).send('no user with that email found');
  }

  // compare the user's password to the supplied password
  if (foundUser.password === password) {
    // correct user
    res.cookie('userId', foundUser.id);
    return res.redirect('/protected');
  }

  return res.status(400).send('incorrect password');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // check if a user with that email already exists
  let foundUser;
  for (const userId in users) {
    if (users[userId].email === email) {
      foundUser = users[userId];
    }
  }

  if (foundUser) {
    return res.status(400).send('a user with that email already exists');
  }

  // create a unique id, and a new user object
  const id = uuid().split('-')[0];
  const newUser = {
    id,
    email,
    password
  }
  users[id] = newUser;

  // redirect to the login page
  return res.redirect('/login');
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
