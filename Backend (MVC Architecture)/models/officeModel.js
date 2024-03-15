const mongoose = require('mongoose');

const officeAdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
});

const OfficeAdmin = mongoose.model('Office', officeAdminSchema);

module.exports = OfficeAdmin;