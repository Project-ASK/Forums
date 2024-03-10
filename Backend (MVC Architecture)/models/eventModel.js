const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: String,
    date: String,
    time: String,
    description: String,
    location: String,
    eventVenue: String,
    imagePath: String,
    forumName: String,
    questions: [{
        question: { type: String },
        type: { type: String }
    }],
    tags: [String],
    collabForums: [String],
    amount: Number
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
