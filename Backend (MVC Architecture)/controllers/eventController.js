const Event = require('../models/eventModel');
const multer = require('multer');
const fs = require('fs');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const express = require('express');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const eventName = req.body.eventName;
        const forumName = req.query.forumName;
        const dir = `./events/${forumName}/${eventName}`;

        fs.exists(dir, exist => {
            if (!exist) {
                return fs.mkdir(dir, { recursive: true }, error => cb(error, dir))
            }
            return cb(null, dir);
        })
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

const upload = multer({ storage });

async function createEvent(req, res) {
    try {
        const { eventName, date, time, location, description, includesPayment, amount, eventVenue } = req.body;
        const forumName = req.query.forumName;
        const questions = JSON.parse(req.body.questions);
        const tags = JSON.parse(req.body.tags);
        const collabForums = JSON.parse(req.body.collabForums);
        const imagePath = req.file.path.replace(/\\/g, '/');

        const event = new Event({ eventName, date, time, location, eventVenue, description, imagePath, forumName, questions, tags, collabForums, includesPayment, amount });

        await event.save();

        res.status(200).send({ message: 'Event created successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error creating event' });
    }
}

async function getAdminEvents(req, res) {
    const { forum } = req.body;
    const admin = await Admin.findOne({ forum });
    if (!admin) {
        return res.status(400).send({ message: 'Admin not found' });
    }
    const events = await Event.find({ forumName: admin.forum });
    res.status(200).send({ events });
}

async function getEvents(req, res) {
    const { forums } = req.body;
    const events = await Event.find({ forumName: { $in: forums } });
    res.status(200).send({ events });
}

async function addCustomEvent(req, res) {
    const { username, event } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    user.customEvents.push(event);
    await user.save();
    res.status(200).send({ success: true });
}

async function deleteCustomEvent(req, res) {
    const { username, event } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    const index = user.customEvents.findIndex(e => e.event_date === event.event_date && e.event_title === event.event_title);
    if (index > -1) {
        user.customEvents.splice(index, 1);
        await user.save();
        res.status(200).send({ success: true });
    } else {
        res.status(400).send({ message: 'Event not found' });
    }
}

async function joinEvent(req, res) {
    const { username, event, forumName, questions, responses } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    const questionResponsePairs = questions.map((question) => ({
        question: question.question,
        response: responses[question.question]
    }));
    user.joinedEvents.push({ eventName: event, forumName, questions: questionResponsePairs });
    await user.save();
    res.status(200).send({ success: true });
}

async function getJoinedEvents(req, res) {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    res.status(200).send({ joinedEvents: user.joinedEvents });
}

async function getQuestions(req, res) {
    const { eventName, forumName } = req.body;
    const event = await Event.findOne({ eventName, forumName });
    if (!event) {
        return res.status(400).send({ message: 'Event not found' });
    }
    res.status(200).send({ questions: event.questions });
}

async function getCollabEvents(req,res){
    const { forum } = req.body;
    const admin = await Admin.findOne({ forum });
    if (!admin) {
        return res.status(400).send({ message: 'Admin not found' });
    }
    const events = await Event.find({ $or: [{ forumName: forum }, { collabForums: forum }] });
    res.status(200).send({ events });
}

async function getEventDetails(req,res){
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(400).send({ message: 'Event not found' });
    }
    res.status(200).send({ event });
}

router.post('/admin/events', upload.single('image'), createEvent); // Handle POST requests to create events
router.post('/admin/getEvents', getAdminEvents);    // Handle GET requests to fetch events
router.post('/getEvents', getEvents);    // Handle GET requests to fetch events
router.post('/addCustomEvent', addCustomEvent);    // Handle POST requests to add custom events
router.post('/deleteCustomEvent', deleteCustomEvent);    // Handle POST requests to delete custom events
router.post('/joinEvent', joinEvent);    // Handle POST requests to join events
router.post('/getJoinedEvents', getJoinedEvents);    // Handle POST requests to fetch joined events
router.post('/getQuestions', getQuestions);    // Handle POST requests to fetch questions
router.post('/admin/getCollabEvents', getCollabEvents);    // Handle POST requests to fetch events
router.post('/admin/getEventDetails', getEventDetails);    // Handle POST requests to fetch event details

module.exports = router;
