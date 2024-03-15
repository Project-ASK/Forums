const OfficeAdmin = require('../models/officeModel');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
// const Event = require('../models/eventModel');
// const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const express = require('express');
const path = require('path');
const router = express.Router();

const SECRET_KEY = 'super-secret-key';

async function postOfficeAdminLogin(req, res) {
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
}

async function getOfficeAdmin(req, res) {
    const { username } = req.body;
    const officeAdmin = await OfficeAdmin.findOne({ username });
    if (!officeAdmin) {
        return res.status(400).send({ message: 'Office admin not found' });
    }
    res.status(200).send({ name: officeAdmin.name, email: officeAdmin.email });
}

router.post('/office/login', postOfficeAdminLogin);
router.post('/office/getDetails', getOfficeAdmin);

module.exports = router;