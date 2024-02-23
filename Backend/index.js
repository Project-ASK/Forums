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

const SECRET_KEY = 'super-secret-key';

app.use(cors())
app.use(bodyParser.json())
// app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
dotenv.config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const username = req.params.username;
        const dir = `./uploads/${username}`;

        fs.exists(dir, exist => {
            if (!exist) {
                return fs.mkdir(dir, error => cb(error, dir))
            }
            return cb(null, dir);
        })
    },
    filename: function (req, file, cb) {
        const originalName = path.basename(file.originalname, path.extname(file.originalname)); // Get the original filename without extension
        cb(null, `${originalName}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

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
    forums: [{
        name: String,
        description: String
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

app.use(upload.none());
router.route('/uploadImage/:username')
    .post(upload.single('image'), async (req, res) => {
        const { username } = req.params;
        console.log('Request body:', req.params); // Retrieve the username from the request body
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        user.image = req.file.path;
        await user.save();
        res.status(200).send({ message: 'Image uploaded successfully' });
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
        res.status(200).send({ forums: user.forums, name: user.name, email: user.email });
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
    'PRODDEC': 'Description for PRODDEC',
    'IEEE': 'Description for IEEE',
    'NSS': 'Description for NSS',
    'NCC': 'Description for NCC',
    'TINKERHUB': 'Description for TINKERHUB',
    'IEDC': 'Description for IEDC',
    'GDSC': 'Description for GDSC',
    'MULEARN': 'Description for MULEARN'
};

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



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
