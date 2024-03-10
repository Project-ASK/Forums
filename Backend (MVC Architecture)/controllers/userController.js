const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

const SECRET_KEY = 'super-secret-key';

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

async function postCheckUser(req, res) {
    const { email, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(400).send({ message: 'A user already exists' });
    }
    res.status(200).send({ message: 'User does not exist' });
}

async function resetPassword(req,res) {
    const { email, newPassword } = req.body;
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Update the password in the database
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    res.status(200).send({ message: 'Password updated successfully' });
}

async function getImages(req, res) {
    const directoryPath = path.join(__dirname, '../uploads/guest');
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return res.status(500).send({ message: 'Unable to scan directory: ' + err });
        }
        res.send(files);
    });
}

async function getForums(req, res) {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    res.status(200).send({ forums: user.forums, name: user.name, email: user.email, customEvents: user.customEvents });
}

async function addForum(req, res) {
    const { name, org, id } = req.body;
    const user = await User.findOne({ name });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    const description = organizationDescriptions[org];
    const orgData = require(`../memberships/${org}.json`);
    const member = orgData.find(member => member.name === name && member.id === id);
    if (member) {
        user.forums.push({ name: org, description });
        await user.save();
        res.status(200).send({ success: true });
    } else {
        res.status(200).send({ success: false });
    }
}

async function getUsers(req, res) {
    const { eventName } = req.body;
    try {
        const users = await User.find({ "joinedEvents.eventName": eventName });
        res.status(200).send({ users });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching users' });
    }
}

async function getUser(req, res) {
    const { userName } = req.body;
    const user = await User.findOne({ username: userName });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }
    res.status(200).send({ name: user.name });
}

async function updateUser(req,res) {
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
}

router.get('/images', getImages);
router.post('/login', postLogin);
router.post('/signup', postSignUp);
router.post('/checkUser', postCheckUser);
router.post('/resetPassword', resetPassword);
router.post('/getForums', getForums);
router.post('/addForum', addForum);
router.post('/event/getUsers', getUsers);
router.post('/getUser', getUser);
router.post('/updateUser', updateUser);

module.exports = router;
