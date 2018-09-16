const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./user-model')
const Exercise = require('./exercise-model')
const format = require('date-fns/format');


mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res) => {
  User.find({ username: req.body.username }, function(err, user) {
  if (err) throw err;
    if(user){
    res.send('username already taken')
    } else {
    var user = new User({
  username: req.body.username
  });
  user.save(function(err) {
  if (err) throw err;
    res.json({
    _id: user._id,
      username: user.username
    });
});
    }
});
});

app.get('/api/exercise/users', (req, res) => {
  User.find({}, function(err, users) {
  if (err) throw err;
    res.json(users)
});
});

app.post('/api/exercise/add', (req, res) => {
  User.findOne({ _id: req.body.userId }, function(err, user) {
  if (err) throw err;
    var exercise = new Exercise({
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date || new Date()
  });
  exercise.save(function(err) {
  if (err) throw err;
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      _id: user._id,
      date: format(exercise.date, 'ddd MMM D YYYY'),
    });
});
});
});

app.get('/api/exercise/log', (req, res) => {
  User.findOne({ _id: req.query.userId }, function(err, user) {
  if (err) throw err;
    var query = { userId: req.query.userId }
    if(req.query.from && req.query.to){
      query.date = { $gt: req.query.from, $lt: req.query.to};
    }
    Exercise.find(query)
      .limit(+req.query.limit || '').exec(function(err, exercises) {
      var cleanedExercises = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: format(exercise.date, 'ddd MMM D YYYY')
      }))
      res.json({
        _id: user._id,
        username: user.username,
        count:exercises.length,
        log: cleanedExercises
      })
    });
});
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
