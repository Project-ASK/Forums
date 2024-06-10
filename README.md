
<p align="center">
  <img src="Frontend/public/assets/logo.png" alt="Project Logo" />
</p>


The project aimed to develop a centralized platform for managing forums like IEEE, GDSC, Tinkerhub, IEDC, and FOSS at a college, enhancing the organizational and participatory aspects of campus life. The system is designed to streamline forum management for administrators and provide students with unified access to all forums, thereby facilitating seamless participation in various events and activities.

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Documentation](#api-documentation)
7. [Security Measures](#security-measures)
8. [License](#license)
9. [Acknowledgements](#acknowledgements)

## Introduction
The Forums Management System is a centralized platform designed to streamline forum management for administrators and provide students with unified access to all forums. This system facilitates seamless participation in various events and activities, enhancing the organizational and participatory aspects of campus life.

## Features
- **Admin Module**: Create and post events, view organization members, send notifications, and track attendance.
- **Event Recommendation System**: Personalized event suggestions using machine learning.
- **Feedback Mechanism**: Ratings and reviews from students for real-time insights.
- **Report Generation**: Generate and upload event reports using generative AI models.
- **Security Enhancements**: Comprehensive security measures including HTTPS implementation.

## Technologies Used
- **Frontend**: ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)

- **Backend**: ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

- **Database**: ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

- **Real-time Communication**: ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
- **Authentication**: EmailJS
- **Machine Learning**: Doc2Vec model
- **Security**: OWASP ZAP, Let's Encrypt

## Installation

### Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

### Backend
1. Open another terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend server:
   ```bash
   node --watch index.js
   ```

### Python ML Module (Word2Vec)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the training script:
   ```bash
   python train.py
   ```

## Usage
1. **Admin Login**
   - Access the admin dashboard to manage forums, events, and members.

2. **Event Recommendation**
   - View personalized event suggestions on the student dashboard.

3. **Feedback and Reports**
   - Submit feedback on events and generate detailed reports.

## API Documentation
- **Endpoints**
  - `/api/events` : Manage events (CRUD operations).
  - `/api/members` : Manage forum members.
  - `/api/recommendations` : Get personalized event recommendations.
  - `/api/reports` : Generate and upload reports.

## Security Measures
- **CSP Headers**: Configured to prevent XSS attacks.
- **HTTPS Implementation**: Ensures secure communication.
- **Penetration Testing**: Regular tests using OWASP ZAP to identify and fix vulnerabilities.


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
- Resources and documentation from Next.js, React, Node.js, Express.js, MongoDB, EmailJS, and OWASP ZAP.
- Project Guide : Associate Prof. Ahammad Siraj for the insights
- Project Coordinator and College for the support.

## Additional Information

We have used Email JS, groq, Gemini, and Stripe services. Please change the keys after creating your own keys by referring to the respective documentation on their websites before running the website.

### Documentation and Reports
For documentation and reports of the project, refer to [docs](https://github.com/Project-ASK/Forums/tree/main/docs).

### Website
The website is publicly available [here](https://forum-management.vercel.app/). Only CECians can access this website using the CHN mail provided by the college. If someone else needs to access this, changes must be made to the backend code.

### Creators
- [Karthik Vijay](https://github.com/karthikvijay5227)
- [Sanjay Mathew](https://github.com/M#BIONIX)
- [R Ashwin](https://github.com/ashwin417)

---

