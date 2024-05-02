const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const port = 3001;
const cors = require('cors');
const multer = require('multer'); // Add this
const path = require('path'); // Add this
const fs = require('fs');
const os = require('os');
const exec = require('child_process').exec;
const cron = require('node-cron');
const { getOrganizationDescriptions, updateOrganizationDescription } = require('./organizationDescriptions');

const SECRET_KEY = 'super-secret-key';

app.use((req, res, next) => {
    // Set Content Security Policy header
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'self'; form-action 'self';"
    );
    res.removeHeader('X-Powered-By');
    next();
});

const corsOptions = {
    origin: ['http://localhost:3000', 'http://karthik1801.myddns.me','http://14.139.189.219'], // Add your trusted domains here
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

// app.use(cors())
app.use(bodyParser.json())
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/eventjson', express.static(path.join(__dirname, 'eventjson')));
app.use('/events', express.static(path.join(__dirname, 'events')));
app.use('/forums', express.static(path.join(__dirname, 'forums')));
dotenv.config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const eventName = req.query.eventName || req.body.eventName;
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
})

const upload = multer({ storage })

// Connect to DB
mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB Connected');
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

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

const reportSchema = new mongoose.Schema({
    year: String,
    path: String
});

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    forum: String,
    reports: [reportSchema]
});

const Admin = mongoose.model('Admin', adminSchema);

const officeAdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
})

const OfficeAdmin = mongoose.model('Office', officeAdminSchema);

const router = express.Router();
app.use('/', router);

router.route('/admin/login')
    .post(postAdminLogin);

async function postAdminLogin(req, res) {
    const { username, password, forum } = req.body;
    const admin = await Admin.findOne({ username, forum });
    if (!admin) {
        return res.status(401).send({ message: 'Incorrect Credentials' });
    }
    else {
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).send({ message: 'Incorrect Credentials' });
        }
        const token = jwt.sign({ adminId: admin._id }, SECRET_KEY, { expiresIn: '1hr' });
        return res.status(200).send({ message: 'Login Successful', forum: admin.forum, email: admin.email, token });
    }
}

router.route('/login')
    .post(postLogin);

async function postLogin(req, res) {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).send({ message: 'Incorrect Credentials' });
    }
    else {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({ message: 'Incorrect Credentials' });
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' });
        return res.status(200).send({ message: 'Login Successful', email: user.email, token });
    }
}

router.route('/checkUser')
    .post(postCheckUser);

async function postCheckUser(req, res) {
    const { email, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).send({ message: 'A user already exists' });
    }
    res.status(200).send({ message: 'User does not exist' });
}

router.route('/signup')
    .post(postSignUp);

async function postSignUp(req, res) {
    const { name, email, username, password } = req.body;
    const organizationDescriptions = getOrganizationDescriptions();
    const forums = ['IEDC', 'GDSC'].map(forumName => ({
        name: forumName,
        description: organizationDescriptions[forumName]
    }));
    const user = new User({ name, email, username, password, forums });
    await user.save();
    res.status(200).send({ message: 'Signup Successful' });
}

router.route('/resetPassword')
    .post(async (req, res) => {
        const { email, newPassword } = req.body;
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update the password in the database
        await User.updateOne({ email }, { $set: { password: hashedPassword } });
        res.status(200).send({ message: 'Password updated successfully' });
    });

router.get('/images', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads/guest');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return res.status(500).send({ message: 'Unable to scan directory: ' + err });
        }
        res.send(files);
    });
});

router.get('/eventJson', (req, res) => {
    const directoryPath = path.join(__dirname, 'eventjson');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return res.status(500).send({ message: 'Unable to scan directory: ' + err });
        }
        res.send(files);
    });
});

router.route('/getForums')
    .post(async (req, res) => {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        res.status(200).send({ forums: user.forums, name: user.name, email: user.email, customEvents: user.customEvents });
    });

router.route('/admin/getForums')
    .post(async (req, res) => {
        const { username } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).send({ message: 'User not found' });
        }
        res.status(200).send({ forum: admin.forum, name: admin.name, email: admin.email, adminId: admin._id });
    });

// const organizationDescriptions = {
//     'PRODDEC': 'PRODDEC is a common platform for the Electronics and Computer students. It was formed in 1995 with the vision of integrating technical ideas from both the fields and to develop products of an engineering outlook. Understanding the industry needs, PRODDEC has contributed greatly to the overall development of the students as competent engineers.',
//     'IEEE': 'IEEE Student Branch of College of Engineering Chengannur formed on 16th of September, 1996 with the goal of keeping the students in touch with technological advances. What started as a small initiative for technical advancement of the students, is now one of the most vibrant Student Branches of the Asia Pacific Region (Region 10) and Kerala Section.',
//     'NSS': 'The vision of the NSS Technical Cell, Kerala is to mould its volunteers as ‘Social Engineers’, who know the pulse of the community and would be able to act accordingly. The mission of the NSS Technical Cell is to make the campuses community-related and to reduce the distance between the social and technical communities. ',
//     'NCC': 'College of Engineering Chengannur has initiated its NCC unit under the NAVAL wing of the Armed Forces. The unit is commissioned on 16th October 2014 with a total strength of 50 cadets. There will be 33% seats reserved for lady cadets. Our NAVY NCC unit functions under 3(K) Navy Unit Kollam, of the Kollam group NCC headquarters.',
//     'TINKERHUB': 'A community to Learn and Teach together #growtogethercec',
//     'IEDC': 'The Innovation and Entrepreneurship Development Cell [IEDC] Bootcamp College of Engineering Chengannur was established in June 2015 in association with Kerala Startup Mission [KSUM], with the vision of molding youngsters into technological entrepreneurs and innovative leaders. KSUM serves as a stepping stone for aspiring business owners looking to enter the field of technology-based jobs and supports entrepreneurs in pursuing their goals.',
//     'GDSC': 'Google Developer Student Clubs are university based community groups for students interested in Google developer technologies. Students from all undergraduate or graduate programs with an interest in growing as a developer are welcome. By joining a GDSC, students grow their knowledge in a peer-to-peer learning environment and build solutions for local businesses and their community.',
//     'MULEARN': 'µLearn is a synergic philosophy of education, with a culture of mutual learning through micro peer groups. We are here to assist you in breaking through the echo chambers and free you from the shackles you have grounded yourself in.'
// };


router.route('/admin/getOrganizationMembers')
    .post(async (req, res) => {
        const { org } = req.body;
        const users = await User.find({ "forums.name": org });
        if (!users) {
            return res.status(400).send({ message: 'No users found for this organization' });
        }
        res.status(200).send({ users });
    });


router.route('/addForum')
    .post(async (req, res) => {
        const { name, org, id } = req.body;
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        const organizationDescriptions = getOrganizationDescriptions();
        const description = organizationDescriptions[org];
        const orgData = require(`./memberships/${org}.json`);
        const member = orgData.find(member => member.name === name && member.id === id);
        if (member) {
            user.forums.push({ name: org, description });
            await user.save();
            res.status(200).send({ success: true });
        } else {
            res.status(200).send({ success: false });
        }
    });

const EventSchema = new mongoose.Schema({
    eventName: String,
    date: String,
    time: String,
    description: String,
    location: String,
    eventVenue: String,
    eventImagePath: String,
    approvalImagePath: String,
    principalApprovalImagePath: String,
    reportPath: String,
    forumName: String,
    questions: [{
        question: { type: String },
        type: { type: String }
    }],
    tags: [String],
    collabForums: [String],
    amount: Number,
    isApproved: String,
    certificateLink: String,
    feedbacks: [{
        feedback: String,
        name: String
    }]
});

const Event = mongoose.model('Event', EventSchema);

router.post('/admin/events', upload.fields([{ name: 'eventImage', maxCount: 1 }, { name: 'approvalImage', maxCount: 1 }]), async (req, res) => {
    const { eventName, date, time, location, description, includesPayment, amount, eventVenue } = req.body;
    const forumName = req.query.forumName;
    const questions = JSON.parse(req.body.questions);
    const tags = JSON.parse(req.body.tags);
    const collabForums = JSON.parse(req.body.collabForums);
    const eventImagePath = req.files['eventImage'][0].path.replace(/\\/g, '/');
    const approvalImagePath = req.files['approvalImage'][0].path.replace(/\\/g, '/');
    const event = new Event({
        eventName, date, time, location, eventVenue, description, eventImagePath, approvalImagePath, forumName, questions, tags, collabForums, includesPayment, amount, isApproved: 'Pending'
    });
    //Used for testing
    // questions.forEach(question => {
    //     event.questions.push({ question: question.question, type: question.type });
    // });
    await event.save();

    res.status(200).send({ message: 'Event created successfully' });
});

router.route('/admin/getEvents')
    .post(async (req, res) => {
        const { forum } = req.body;
        const admin = await Admin.findOne({ forum });
        if (!admin) {
            return res.status(400).send({ message: 'Admin not found' });
        }
        const events = await Event.find({ forumName: admin.forum });
        res.status(200).send({ events });
    });

router.route('/getEvents')
    .post(async (req, res) => {
        const { forums } = req.body;
        const events = await Event.find({ forumName: { $in: forums }, isApproved: 'Approved' });
        res.status(200).send({ events });
    });


router.route('/addCustomEvent')
    .post(async (req, res) => {
        const { username, event } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        user.customEvents.push(event);
        await user.save();
        res.status(200).send({ success: true });
    });

router.route('/deleteCustomEvent')
    .post(async (req, res) => {
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
    });

router.route('/joinEvent')
    .post(async (req, res) => {
        const { username, event, forumName, questions, responses } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        const hasJoined = user.joinedEvents.some(joinedEvent => joinedEvent.eventName === event);
        if (!hasJoined) {
            const questionResponsePairs = questions.map((question) => ({
                question: question.question,
                response: responses[question.question]
            }));
            user.joinedEvents.push({ eventName: event, forumName, questions: questionResponsePairs });
            await user.save();
            res.status(200).send({ success: true });
        } else {
            res.status(200).send({ message: 'User has already joined this event' });
        }
    });

router.route('/getJoinedEvents')
    .post(async (req, res) => {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        res.status(200).send({ joinedEvents: user.joinedEvents });
    });

router.route('/getQuestions')
    .post(async (req, res) => {
        const { eventName, forumName } = req.body;
        const event = await Event.findOne({ eventName, forumName });
        if (!event) {
            return res.status(400).send({ message: 'Event not found' });
        }
        res.status(200).send({ questions: event.questions });
    });

router.route('/admin/getCollabEvents')
    .post(async (req, res) => {
        const { forum } = req.body;
        const admin = await Admin.findOne({ forum });
        if (!admin) {
            return res.status(400).send({ message: 'Admin not found' });
        }
        const events = await Event.find({ $or: [{ forumName: forum }, { collabForums: forum }] });
        res.status(200).send({ events });
    });

router.route('/admin/getEventDetails')
    .post(async (req, res) => {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(400).send({ message: 'Event not found' });
        }
        res.status(200).send({ event });
    });


router.route('/event/getUsers')
    .post(async (req, res) => {
        const { eventName } = req.body;
        try {
            const users = await User.find({ "joinedEvents.eventName": eventName });
            res.status(200).send({ users });
        } catch (error) {
            res.status(500).send({ message: 'Error fetching users' });
        }
    });

router.route('/admin/appendMembers')
    .post(async (req, res) => {
        const { forum, members } = req.body;
        console.log(forum);
        const filePath = path.join(__dirname, `./memberships/${forum}.json`);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
            } else {
                const databases = JSON.parse(data);
                databases.push(...members);

                fs.writeFile(filePath, JSON.stringify(databases, null, 4), (err) => {
                    if (err) {
                        console.error(`Error writing file to disk: ${err}`);
                    }
                });
            }
        });
        res.status(200).send({ status: 'success' });
    });

router.route('/getUser')
    .post(async (req, res) => {
        const { userName } = req.body;
        const user = await User.findOne({ username: userName });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        res.status(200).send({ user });

    })

router.route('/updateUser')
    .post(async (req, res) => {
        const { userName, name, reg, phone, year, branch, about, topics } = req.body;
        const user = await User.findOne({ username: userName });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        if (user.name !== name) {
            user.name = name;
        }
        user.regNo = reg;
        user.phoneNumber = phone;
        user.yearOfJoin = year;
        user.branch = branch;
        user.about = about;
        user.topics = topics;
        await user.save();
        res.status(200).send({ message: 'User Updated' });
    })

router.route('/checkAndUpdateUser')
    .post(async (req, res) => {
        const { name, event, forumName } = req.body;
        const user = await User.findOne({ name, "forums.name": forumName });

        if (user) {
            user.joinedEvents.push({ eventName: event, forumName }); // replace 'Your Forum Name' with the actual forum name
            await user.save();
            res.status(200).send({ success: true });
        } else {
            res.status(200).send({ success: false });
        }
    });

router.route('/removeUserFromEvent')
    .post(async (req, res) => {
        const { name, event } = req.body;
        const user = await User.findOne({ name });

        if (user) {
            const index = user.joinedEvents.findIndex(joinedEvent => joinedEvent.eventName === event);
            if (index > -1) {
                user.joinedEvents.splice(index, 1);
                await user.save();
                res.status(200).send({ success: true });
            } else {
                res.status(200).send({ success: false });
            }
        } else {
            res.status(200).send({ success: false });
        }
    });

router.route('/updateAttendanceStatus')
    .post(async (req, res) => {
        const { name, event, attended } = req.body;
        const user = await User.findOne({ name });

        if (user) {
            const eventIndex = user.joinedEvents.findIndex(joinedEvent => joinedEvent.eventName === event);
            if (eventIndex > -1) {
                user.joinedEvents[eventIndex].isAttended = attended;
                await user.save();
                res.status(200).send({ success: true });
            } else {
                res.status(200).send({ success: false });
            }
        } else {
            res.status(200).send({ success: false });
        }
    });

router.route('/office/login')
    .post(async (req, res) => {
        const { username, password } = req.body;
        const office = await OfficeAdmin.findOne({ username });
        if (!office) {
            return res.status(401).send({ message: 'Incorrect Credentials' });
        }
        else {
            const validPassword = await bcrypt.compare(password, office.password);
            if (!validPassword) {
                return res.status(401).send({ message: 'Incorrect Credentials' });
            }
            const token = jwt.sign({ officeId: office._id }, SECRET_KEY, { expiresIn: '1hr' });
            return res.status(200).send({ message: 'Login Successful', email: office.email, token });
        }
    })

router.route('/office/getDetails')
    .post(async (req, res) => {
        const { username } = req.body;
        const officeAdmin = await OfficeAdmin.findOne({ username });
        if (!officeAdmin) {
            return res.status(400).send({ message: 'Office admin not found' });
        }
        res.status(200).send({ name: officeAdmin.name, email: officeAdmin.email, officeId: officeAdmin._id });
    });

router.route('/getAllEvents')
    .get(async (req, res) => {
        const events = await Event.find({ isApproved: 'Approved' });
        res.status(200).send({ events });
    });

router.route('/recommendation')
    .post(async (req, res) => {
        const { username } = req.body;
        //Used to run python script based on os platform (Different OS has command differences)
        let command;
        if (os.platform() === 'win32') {
            // Windows
            command = `python model.py ${username}`;
        } else if (os.platform() === 'linux') {
            // Linux
            command = `python3 model.py ${username}`;
        } else {
            // Other platforms (darwin, openbsd, etc.)
            command = `python model.py ${username}`;
        }
        const user = await User.find({});
        const formattedUsers = user.map(user => ({
            _id: { $oid: user._id.toString() },
            name: user.name,
            username: user.username,
            about: user.about,
            topics: user.topics
        }));

        const events = await Event.find({});
        const formattedEvents = events.map(event => ({
            _id: { $oid: event._id.toString() },
            eventName: event.eventName,
            eventDate: event.date,
            tags: event.tags
        }));

        // Create an object for the output
        const output = {
            user: formattedUsers,
            events: formattedEvents
        };

        // Convert it to a JSON string
        const jsonOutput = JSON.stringify(output, null, 2);

        // Write it to a file in your directory
        try {
            await fs.promises.writeFile('training.json', jsonOutput);
            // await fs.promises.writeFile(`eventjson/${username}_events.json`, '[]');
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
            res.status(200).send({ message: 'Successfully written to file and Python script executed' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error writing to file' });
        }
    });

cron.schedule('0 0 */2 * *', async () => { // Make this function async
    try {
        // This function will run every 2 days
        const user = await User.find({});
        //Used to run python script based on os platform (Different OS has command differences)
        let scheduler;
        if (os.platform() === 'win32') {
            // Windows
            command = 'python train.py';
        } else if (os.platform() === 'linux') {
            // Linux
            command = 'python3 train.py';
        } else {
            // Other platforms (darwin, openbsd, etc.)
            command = 'python train.py';
        }
        const formattedUsers = user.map(user => ({
            _id: { $oid: user._id.toString() },
            name: user.name,
            username: user.username,
            about: user.about,
            topics: user.topics
        }));

        const events = await Event.find({});
        const formattedEvents = events.map(event => ({
            _id: { $oid: event._id.toString() },
            eventName: event.eventName,
            eventDate: event.date,
            tags: event.tags
        }));

        // Create an object for the output
        const output = {
            user: formattedUsers,
            events: formattedEvents
        };

        // Convert it to a JSON string
        const jsonOutput = JSON.stringify(output, null, 2);

        // Convert the data to JSON and write it to training.json
        await fs.promises.writeFile('training.json', jsonOutput);
        exec(scheduler, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
        res.status(200).send({ message: 'Successfully updated training set and updated recommendation model' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error writing to file' });
    }
});

router.route('/officeadmin/getAllEvents')
    .post(async (req, res) => {
        try {
            const events = await Event.find({});
            res.status(200).send({ events });
        } catch (error) {
            res.status(500).send({ message: 'Error fetching events' });
        }
    });

router.post('/updateEventApproval', async (req, res) => {
    const { eventId, isApproved } = req.body;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        event.isApproved = isApproved;
        await event.save();
        res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.route('/getAllForums')
    .post(async (req, res) => {
        try {
            const admins = await Admin.find();
            const forums = admins.map(admin => admin.forum);
            res.status(200).send({ forums });
        } catch (error) {
            res.status(500).send({ message: 'Error fetching forums' });
        }
    });

router.route('/getAdminByForum')
    .post(async (req, res) => {
        const { forum } = req.body;
        const admin = await Admin.findOne({ forum });
        if (!admin) {
            return res.status(400).send({ message: 'Admin not found' });
        }
        res.status(200).send({ name: admin.name, adminId: admin._id });
    });

const server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// At the top of your backend code, import Socket.io
const io = require('socket.io')(server, {
    cors: {
        origin: "*", // replace with your front-end domain
        methods: ["GET", "POST"]
    }
});

const ChatByDateSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    messages: [{
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, required: true },
    }],
});

// Create a new model for chat messages by date
const ChatByDate = mongoose.model('ChatByDate', ChatByDateSchema);

// Socket.io event handlers
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.onAny(async (eventName, data) => {
        const { text, officeId, adminId } = data;
        const timestamp = new Date();

        if (eventName === `message_${officeId}_${adminId}`) {
            // console.log("This is a main_admin_message");
            await saveMessage(officeId, adminId, text);
        } else if (eventName === `message_${adminId}_${officeId}`) {
            // console.log("This is a smaller_admin_message");
            await saveMessage(adminId, officeId, text);
        }

        // Forward the message to all connected clients
        io.emit(eventName, { ...data, timestamp }); // Forward event
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const saveMessage = async (sender, receiver, message) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Find or create a chat document for the current date
    let chatByDate = await ChatByDate.findOne({ date: currentDate });
    if (!chatByDate) {
        chatByDate = new ChatByDate({ date: currentDate, messages: [] });
    }

    if (!sender || !receiver) {
        throw new Error('Both sender and receiver must be provided');
    }

    // Push the new message to the messages array
    chatByDate.messages.push({
        sender,
        receiver,
        message,
        timestamp: new Date()
    });

    // Save the chat document
    await chatByDate.save();
};

router.route('/chatHistory')
    .post(getChatHistory);

async function getChatHistory(req, res) {
    try {
        const { officeId, adminId } = req.body;

        // Find the chat document for the requested date
        const chatByDate = await ChatByDate.find({
            $or: [
                { $and: [{ 'messages.sender': adminId }, { 'messages.receiver': officeId }] },
                { $and: [{ 'messages.sender': officeId }, { 'messages.receiver': adminId }] }
            ]
        });
        // console.log(chatByDate[1].messages[0]);
        if (!chatByDate) {
            return res.status(404).send({ message: 'Chat history not found for the requested date' });
        }

        // const chatHistory = chatByDate.messages.filter(msg => (msg.sender === officeId && msg.receiver === adminId) || (msg.sender === adminId && msg.receiver === officeId));

        // Return the chat history
        res.status(200).send({ chatByDate });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

router.route('/officeadminId')
    .post(async (req, res) => {
        try {
            const officeAdmin = await OfficeAdmin.find({});
            if (!officeAdmin) {
                return res.status(400).send({ message: 'Office admin not found' });
            }
            res.status(200).send({ officeId: officeAdmin[0]._id });
        } catch (error) {
            console.error('Error fetching office admin:', error);
            res.status(500).send({ message: 'Internal server error' });
        }
    });

router.route('/admin/updateEvent')
    .post(async (req, res) => {
        const { eventId, eventName, date, location, time, description, amount, eventVenue, questions, tags, collabForums, certificateLink } = req.body;
        try {
            const event = await Event.findOne({ eventId });
            if (!event) {
                return res.status(404).send({ message: 'Event not found' });
            }
            event.eventName = eventName;
            event.date = date;
            event.time = time;
            event.location = location;
            event.description = description;
            event.amount = amount;
            event.eventVenue = eventVenue;
            event.questions = questions;
            event.tags = tags;
            event.collabForums = collabForums;
            event.certificateLink = certificateLink;
            await event.save();
            res.status(200).send({ message: 'Event updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'An error occurred' });
        }
    });

router.route('/admin/deleteEvent')
    .post(async (req, res) => {
        const { eventId } = req.body;
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).send({ message: 'Event not found' });
            }

            // Define the path of the folder to delete
            const dirPath = path.join(__dirname, 'events', event.forumName, event.eventName);

            // Delete the folder
            // Use fs.rmdir(prone to deprecation) or fs.rm
            fs.rmdir(dirPath, { recursive: true }, (err) => {
                if (err) {
                    console.error(`Error while deleting directory ${dirPath}: ${err}`);
                } else {
                    console.log(`Directory ${dirPath} has been deleted!`);
                }
            });

            await Event.deleteOne({ _id: eventId });
            res.status(200).send({ message: 'Event and corresponding directory deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'An error occurred' });
        }
    });

router.route('/admin/chatHistory')
    .post(getChats);

async function getChats(req, res) {
    try {
        const { adminId } = req.body;
        const chatByDate = await ChatByDate.find(); // Fetch all chat data

        // Filter messages where the receiver is adminId
        const filteredChats = chatByDate.map(chat => ({
            ...chat.toObject(),
            messages: chat.messages.filter(msg => msg.receiver === adminId)
        }));

        res.status(200).send({ chatByDate: filteredChats });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

const chatSchema = new mongoose.Schema({
    date: { type: String, required: true },
    messages: [{
        message: { type: String, required: true },
        timestamp: { type: String, required: true }
    }]
});

const Posts = mongoose.model('Chat', chatSchema);

router.post('/postMessages', async (req, res) => {
    try {
        const { date, messages } = req.body;

        // Find existing chat document or create a new one
        let chat = await Posts.findOne({ date });

        if (!chat) {
            // If chat document doesn't exist, create a new one
            chat = new Posts({ date, messages });
        } else {
            // If chat document exists, append new messages to the existing array
            chat.messages.push(...messages);
        }

        // Save the updated chat document to the database
        await chat.save();

        res.status(200).send({ message: 'Messages stored successfully' });
    } catch (error) {
        console.error('Error storing messages:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.get('/fetchPosts', async (req, res) => {
    try {
        const posts = await Posts.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    isAttended: {
        type: Boolean,
        required: true
    }
});

const Guest = mongoose.model('Guest', guestSchema);

router.post('/guest/register', async (req, res) => {
    try {
        const { name, email, phone, college, eventName, eventId, type, isAttended } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !phone || !college || !eventName || !eventId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the guest already exists based on email or phone number
        const existingGuest = await Guest.findOne({ $or: [{ email }, { phone }] });
        if (existingGuest) {
            return res.status(400).json({ message: 'Guest with this email or phone number already exists' });
        }

        // Create a new guest
        const newGuest = new Guest({
            name,
            email,
            phoneNumber: phone,
            college,
            eventName,
            eventId,
            type,
            isAttended
        });

        // Save the new guest to the database
        await newGuest.save();

        // Respond with success message
        return res.status(201).json({ message: 'Guest registered successfully' });
    } catch (error) {
        console.error('Error registering guest:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/getGuestUsers', async (req, res) => {
    try {
        const { eventId } = req.body;

        // Fetch users from the user database
        const guestUsers = await Guest.find({ eventId });

        // Respond with the combined array of users
        return res.status(200).json({ guestUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.route('/updateGuestAttendanceStatus')
    .post(async (req, res) => {
        const { name, event, attended } = req.body;
        const guestUser = await Guest.findOne({ name, eventName: event });

        if (guestUser) {
            guestUser.isAttended = attended;
            await guestUser.save();
            res.status(200).send({ success: true });
        } else {
            res.status(200).send({ success: false });
        }
    });

router.route('/removeGuestFromEvent')
    .post(async (req, res) => {
        const { name, event } = req.body;
        const guestUser = await Guest.findOne({ name, eventName: event });

        if (guestUser) {
            await Guest.deleteOne({ name, eventName: event });
            res.status(200).send({ success: true });
        } else {
            res.status(200).send({ success: false });
        }
    });

router.route('/submitFeedback')
    .post(async (req, res) => {
        const { name, eventId, feedback } = req.body;
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).send({ message: 'Event not found' });
            }
            // Append feedback and username to the event's feedbacks array
            event.feedbacks.push({ feedback, name });
            await event.save();
            return res.status(200).send({ success: true });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            return res.status(500).send({ message: 'Internal server error' });
        }
    });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    const { amount, eventName } = req.body;
    const finalAmount = amount * 100;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: eventName,
                    },
                    unit_amount: finalAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/user/userDB?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/user/userDB`,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/payment/check-payment-status', async (req, res) => {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send({ paymentStatus: session.payment_status });
});

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const Groq = require('groq-sdk');
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post('/genAI/prompt/:model', async (req, res) => {
    const { eventName, eventDate, eventTime, eventLocation, eventParticipant } = req.body;
    const { model } = req.params;

    const content = `Generate an event report for an event named ${eventName} which is held on ${eventDate} ,${eventTime} at ${eventLocation}. A total of ${eventParticipant} students attended the event the report should mention today's date, title as \"post event report\" along with the tag [your name] to sign at the end.`;
    let aiPrompt = '';

    if (model === 'gemini') {
        const MODEL_NAME = "gemini-1.0-pro";
        const API_KEY = process.env.GEMINI_API_KEY; // Use your Gemini API key

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: [],
        });

        const result = await chat.sendMessage(content);
        const response = result.response;
        aiPrompt = response.text()
            .replace(/\*\*((.|[\r\n])+?)\*\*/g, '<strong>$1</strong>') // Replace **...** with <strong>...</strong>
            .replace(/\n+/g, '<br>'); // Replace consecutive newline characters with <br>

    } else if (model === 'groq') {
        const MODEL_NAME = "llama3-70b-8192";

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": content
                }
            ],
            "model": MODEL_NAME,
            "temperature": 0.9,
            "max_tokens": 4096,
            "top_p": 1,
            "stream": true,
            "stop": null
        });

        for await (const chunk of chatCompletion) {
            aiPrompt += chunk.choices[0]?.delta?.content || '';
        }

        aiPrompt = aiPrompt
            .replace(/\*\*((.|[\r\n])+?)\*\*/g, '<strong>$1</strong>') // Replace **...** with <strong>...</strong>
            .replace(/\n+/g, '<br>'); // Replace consecutive newline characters with <br>
    } else {
        res.status(400).json({ error: 'Invalid model' });
        return;
    }

    res.status(200).json({ text: aiPrompt }); // Send the generated text back as the response
});

router.post('/updatePrincipalApprovalImage', upload.single('principalApprovalImage'), async (req, res) => {
    // Get the event id, forum name, event name and file from the request
    const eventId = req.body.eventId;
    const principalApprovalImagePath = req.file.path.replace(/\\/g, '/');

    // Find the event in the database
    const event = await Event.findById(eventId);

    // Check if the event exists
    if (!event) {
        return res.status(404).send({ message: 'Event not found' });
    }

    // Update the principalApprovalImagePath of the event
    event.principalApprovalImagePath = principalApprovalImagePath;

    // Save the event
    await event.save();

    // Send the updated event as the response
    res.status(200).send(event);
});

const reportStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const forumName = req.query.forumName;
        const year = new Date().getFullYear(); // get the current year
        const dir = `./events/${forumName}/report-${year}`; // use the year in the directory path

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
})

const reportUpload = multer({ storage: reportStorage })

router.post('/updloadAnnualReport', reportUpload.single('annualReport'), async (req, res) => {
    const forumName = req.query.forumName;
    const year = new Date().getFullYear(); // get the current year
    const filePath = `./events/${forumName}/report-${year}/${req.file.originalname}`;
    const admin = await Admin.findOne({ forum: forumName });
    if (admin) {
        const report = {
            year: `${year}`,
            path: filePath
        };
        admin.reports.push(report);
        await admin.save();
    }
    res.status(200).json({ message: "Success" });
});

const eventReportStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const forumName = req.query.forumName;
        const eventName = req.query.eventName;
        const dir = `./events/${forumName}/${eventName}`; // use the year in the directory path

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
})

const eventReportUpload = multer({ storage: eventReportStorage })

router.post('/updloadEventReport', eventReportUpload.single('eventReport'), async (req, res) => {
    const eventName = req.query.eventName;
    const eventReport = req.file.path.replace(/\\/g, '/');
    const event = await Event.findOne({ eventName });

    // Check if the event exists
    if (!event) {
        return res.status(404).send({ message: 'Event not found' });
    }
    event.reportPath = eventReport;

    await event.save();
    res.status(200).json({ message: "Success" });
});

router.route('/getReportYears')
    .post(async (req, res) => {
        const { forum } = req.body;
        const admin = await Admin.findOne({ forum });
        if (!admin) {
            return res.status(400).send({ message: 'Admin not found' });
        }
        const years = admin.reports.map(report => report.year);
        res.status(200).send({ years });
    });

router.get('/getReport', async (req, res) => {
    const { forum, year } = req.query;
    const dir = `./events/${forum}/report-${year}`;

    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Unable to read directory' });
        }

        const reportFile = files.find(file => path.extname(file) === '.pdf');

        if (!reportFile) {
            return res.status(404).send({ message: 'Report not found' });
        }

        res.download(path.join(dir, reportFile));
    });
});

router.route('/getAllEventsByForum')
    .get(async (req, res) => {
        const { forum } = req.query;
        const events = await Event.find({ isApproved: 'Approved', forumName: forum });
        res.status(200).send({ events });
    });

router.get('/getEventReport', async (req, res) => {
    const { forum, eventName } = req.query;
    const dir = `./events/${forum}/${eventName}`;

    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Unable to read directory' });
        }

        const reportFile = files.find(file => path.extname(file) === '.pdf');

        if (!reportFile) {
            return res.status(404).send({ message: 'Report not found' });
        }

        res.download(path.join(dir, reportFile));
    });
});

router.post('/officeadmin/createNewAdmin', async (req, res) => {
    const { name, email, username, password, forum, organizationDescription } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            username,
            password: hashedPassword,
            forum
        });

        await admin.save();
        updateOrganizationDescription(forum, organizationDescription);

        // Create a new JSON file in the memberships folder
        const filePath = path.join(__dirname, 'memberships', `${forum}.json`);
        fs.writeFileSync(filePath, JSON.stringify([]));
        res.status(200).send({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).send({ message: 'Error creating admin' });
    }
});

const forumStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = `./forums`; // Directory to save forum images
        fs.exists(dir, exist => {
            if (!exist) {
                return fs.mkdir(dir, { recursive: true }, error => cb(error, dir))
            }
            return cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

const forumUpload = multer({ storage: forumStorage });

router.post('/officeadmin/uploadForumLogo', forumUpload.single('forumImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }

    // Handle saving the file path to the database or any other necessary actions

    res.status(200).send('File uploaded successfully.');
});