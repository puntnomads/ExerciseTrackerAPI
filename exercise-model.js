var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ExerciseSchema = new Schema({
    userId: Schema.Types.ObjectId,
    description: String,
    duration: Number,
    date: Date
});

module.exports = mongoose.model('Exercise', ExerciseSchema );