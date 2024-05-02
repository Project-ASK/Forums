// organizationDescriptions.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'organizationDescriptions.json');

// Function to get the organizationDescriptions
function getOrganizationDescriptions() {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } else {
        return {};
    }
}

// Function to update the organizationDescriptions
function updateOrganizationDescription(forum, description) {
    const organizationDescriptions = getOrganizationDescriptions();
    organizationDescriptions[forum] = description;
    fs.writeFileSync(filePath, JSON.stringify(organizationDescriptions, null, 2));
}

module.exports = { getOrganizationDescriptions, updateOrganizationDescription };
