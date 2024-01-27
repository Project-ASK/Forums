const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const port = 3001;
const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use(express.static('public'));
dotenv.config();

const router = express.Router();
app.use('/', router);

router.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});





