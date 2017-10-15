var mongoose = require('mongoose');

// define the schema for our user model
var recordingSchema = mongoose.Schema({
	sid: String,
    number: String,
    read: Boolean,
    url: String,
    date: Number,
    transcription: String

});

recordingSchema.methods.markRead = function() {
    this.read = true;
}

// create the model for users and expose it to our app
module.exports = mongoose.model('Recording', recordingSchema);