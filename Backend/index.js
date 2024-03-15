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
const htmlToPdf = require('html-pdf');

const SECRET_KEY = 'super-secret-key';

app.use(cors())
app.use(bodyParser.json())
// app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/events', express.static(path.join(__dirname, 'events')));
dotenv.config();

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
})

const upload = multer({ storage })

// Connect to DB
mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB Connected');
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

const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    forum: String
});

const Admin = mongoose.model('Admin', adminSchema);

const officeAdminSchema = new mongoose.Schema({
    name:String,
    email:String,
    username: String,
    password: String,
})

const OfficeAdmin = mongoose.model('Office',officeAdminSchema);

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
        res.status(200).send({ forum: admin.forum, name: admin.name, email: admin.email });
    });

const organizationDescriptions = {
    'PRODDEC': 'PRODDEC is a common platform for the Electronics and Computer students. It was formed in 1995 with the vision of integrating technical ideas from both the fields and to develop products of an engineering outlook. Understanding the industry needs, PRODDEC has contributed greatly to the overall development of the students as competent engineers.',
    'IEEE': 'IEEE Student Branch of College of Engineering Chengannur formed on 16th of September, 1996 with the goal of keeping the students in touch with technological advances. What started as a small initiative for technical advancement of the students, is now one of the most vibrant Student Branches of the Asia Pacific Region (Region 10) and Kerala Section',
    'NSS': 'The vision of the NSS Technical Cell, Kerala is to mould its volunteers as ‘Social Engineers’, who know the pulse of the community and would be able to act accordingly. The mission of the NSS Technical Cell is to make the campuses community-related and to reduce the distance between the social and technical communities. ',
    'NCC': 'College of Engineering Chengannur has initiated its NCC unit under the NAVAL wing of the Armed Forces. The unit is commissioned on 16th October 2014 with a total strength of 50 cadets. There will be 33% seats reserved for lady cadets. Our NAVY NCC unit functions under 3(K) Navy Unit Kollam, of the Kollam group NCC headquarters.',
    'TINKERHUB': 'Description for TINKERHUB',
    'IEDC': 'Description for IEDC',
    'GDSC': 'Description for GDSC',
    'MULEARN': 'Description for MULEARN'
};


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

const Event = mongoose.model('Event', EventSchema);

router.post('/admin/events', upload.single('image'), async (req, res) => {
    const { eventName, date, time, location, description, includesPayment, amount, eventVenue } = req.body;
    const forumName = req.query.forumName;
    const questions = JSON.parse(req.body.questions);
    const tags = JSON.parse(req.body.tags);
    const collabForums = JSON.parse(req.body.collabForums);
    const imagePath = req.file.path.replace(/\\/g, '/');
    const event = new Event({ eventName, date, time, location, eventVenue, description, imagePath, forumName, questions, tags, collabForums, includesPayment, amount });
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
        const events = await Event.find({ forumName: { $in: forums } });
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
        const questionResponsePairs = questions.map((question) => ({
            question: question.question,
            response: responses[question.question]
        }));
        user.joinedEvents.push({ eventName: event, forumName, questions: questionResponsePairs });
        await user.save();
        res.status(200).send({ success: true });
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
        res.status(200).send({ name: user.name });

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
        user.reg = reg;
        user.phoneNumber = phone;
        user.yearOfJoin = year;
        user.branch = branch;
        user.about = about;
        user.topics = topics;
        await user.save();
        res.status(200).send({ message: 'User Updated' });
    })

router.post('/generateHtmlPdf', async (req, res) => {
    const { richTextContent } = req.body;

    if (!richTextContent || richTextContent.trim() === '') {
        return res.status(400).json({ error: 'Rich text content is empty' });
    }

    // Create an HTML file with the rich text content
    const contentState = JSON.parse(richTextContent);

    // Convert Draft.js content state to HTML
    const htmlContent = draftToHtml(contentState);
    const htmlFilename = 'output.html';
    fs.writeFileSync(htmlFilename, htmlContent);

    // Convert HTML to PDF
    htmlToPdf.create(htmlContent, {}).toBuffer((err, buffer) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to generate PDF' });
        } else {
            const base64String = buffer.toString('base64');
            res.status(200).json({ pdf: base64String });
        }

        // Delete HTML file
        fs.unlinkSync(htmlFilename);
    });
});

function draftToHtml(contentState) {
    const blocks = contentState.blocks.map(block => {
        let text = block.text;
        let blockHtml = '';

        switch (block.type) {
            case 'unordered-list-item':
                blockHtml += '<ul>';
                blockHtml += `<li>${text}</li>`;
                blockHtml += '</ul>';
                break;
            case 'ordered-list-item':
                blockHtml += '<ol>';
                blockHtml += `<li>${text}</li>`;
                blockHtml += '</ol>';
                break;
            case 'header-one':
                blockHtml += `<h1>${text}</h1>`;
                break;
            case 'header-two':
                blockHtml += `<h2>${text}</h2>`;
                break;
            default:
                // Check for inline styles
                if (block.inlineStyleRanges.length > 0) {
                    let styledText = text;
                    block.inlineStyleRanges.forEach(style => {
                        const startTag = style.style === 'BOLD' ? '<strong>' : ''; // Use <strong> for bold
                        const endTag = style.style === 'BOLD' ? '</strong>' : ''; // Use </strong> for bold
                        styledText = styledText.slice(0, style.offset) + startTag + styledText.slice(style.offset, style.offset + style.length) + endTag + styledText.slice(style.offset + style.length);
                    });
                    blockHtml += `<p>${styledText}</p>`;
                } else {
                    blockHtml += `<p>${text}</p>`;
                }
                break;
        }

        return blockHtml;
    });

    return blocks.join('');
}

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
    .post(async (req,res) => {
        const {username,password} = req.body;
        const office = await OfficeAdmin.findOne({username});
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
        res.status(200).send({ name: officeAdmin.name, email: officeAdmin.email });
    });

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
