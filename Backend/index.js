const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const port = 3001;
const cors = require('cors');

const SECRET_KEY = 'super-secret-key';

app.use(cors())
app.use(bodyParser.json())
// app.use(express.static('public'));
dotenv.config();

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
});

const User = mongoose.model('User', userSchema);

const router = express.Router();
app.use('/', router);

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

router.route('/signup')
    .post(postSignUp);

async function postSignUp(req, res) {
    const { name, email, username, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).send({ message: 'A user already exists' });
    }
    const user = new User({ name, email, username, password });
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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
