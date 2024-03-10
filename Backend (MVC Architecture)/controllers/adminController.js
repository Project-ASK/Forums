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
const htmlToPdf = require('html-pdf');

const SECRET_KEY = 'super-secret-key';

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

async function getForums(req, res) {
    const { username } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(400).send({ message: 'User not found' });
    }
    res.status(200).send({ forum: admin.forum, name: admin.name, email: admin.email });
}

async function getOrganizationMembers(req, res) {
    const { org } = req.body;
    const users = await User.find({ "forums.name": org });
    if (!users) {
        return res.status(400).send({ message: 'No users found for this organization' });
    }
    res.status(200).send({ users });
}

async function appendMembers(req, res) {
    const { forum, members } = req.body;
    console.log(forum);
    const filePath = path.join(__dirname, `../memberships/${forum}.json`);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`Error reading file from disk: ${err}`);
            return;
        }
        const databases = JSON.parse(data);
        databases.push(...members);

        fs.writeFile(filePath, JSON.stringify(databases, null, 4), (err) => {
            if (err) {
                console.error(`Error writing file to disk: ${err}`);
            }
        });
    });
    res.status(200).send({ status: 'success' });
}

async function generateHTMLPdf(req, res) {
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
}

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

async function checkAndUpdateUser(req, res) {
    const { name, event, forumName } = req.body;
    const user = await User.findOne({ name, "forums.name": forumName });

    if (user) {
        user.joinedEvents.push({ eventName: event, forumName }); // replace 'Your Forum Name' with the actual forum name
        await user.save();
        res.status(200).send({ success: true });
    } else {
        res.status(200).send({ success: false });
    }
}

async function removeUserFromEvent(req, res) {
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
}

async function updateAttendanceStatus(req, res) {
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
}

router.post('/admin/login', postAdminLogin);
router.post('/admin/getForums', getForums);
router.post('/admin/getOrganizationMembers', getOrganizationMembers);
router.post('/admin/appendMembers', appendMembers);
router.post('/generateHTMLPdf', generateHTMLPdf);
router.post('/checkAndUpdateUser', checkAndUpdateUser);
router.post('/removeUserFromEvent', removeUserFromEvent);
router.post('/updateAttendanceStatus', updateAttendanceStatus);

module.exports = router;