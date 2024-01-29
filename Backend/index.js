const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const port = 3001;
const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use(express.static('public'));
dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
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
    const { email, username, password } = req.body;
    const user = await User.findOne({ email, username });
    if (!user) {
        return res.status(401).send({ message: 'Incorrect Credentials' });
    }
    else {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({ message: 'Incorrect Credentials' });
        }
        return res.status(200).send({ message: 'Login Successful' });
    }
}

router.route('/signup')
    .post(postSignUp);

async function postSignUp(req, res) {
    const { name, email, username, password } = req.body;
    const user = new User({ name, email, username, password });
    await user.save();
    res.status(200).send({ message: 'Signup Successful' });
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
