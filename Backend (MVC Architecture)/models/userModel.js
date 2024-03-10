const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    about: String, // About
    regNo: String, // Registration number
    branch: String, // Branch
    phoneNumber: String, // Phone number
    yearOfJoin: String, // Year
    topics: [String], // Topics of interest
    forums: [{
        name: String,
        description: String
    }],
    customEvents: [{
        event_date: String,
        event_title: String,
        event_theme: String
    }],
    joinedEvents: [{
        eventName: String,
        forumName: String,
        questions: [{
            question: { type: String },
            response: { type: String }
        }],
        isAttended: Boolean
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
