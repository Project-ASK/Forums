import * as React from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function Footer() {

  const [termsOpen, setTermsOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);

  const handleTermsOpen = () => setTermsOpen(true);
  const handleTermsClose = () => setTermsOpen(false);

  const handlePrivacyOpen = () => setPrivacyOpen(true);
  const handlePrivacyClose = () => setPrivacyOpen(false);

  const handleContactOpen = () => setContactOpen(true);
  const handleContactClose = () => setContactOpen(false);

  const handleAboutOpen = () => setAboutOpen(true);
  const handleAboutClose = () => setAboutOpen(false);

  const termsBody = (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        <b>Terms and Conditions</b>
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        <b>Last updated: April 25, 2024</b><br />
        Please read these terms and conditions carefully before using the Forums website (the "Service") operated by Forums ("us", "we", or "our").<br /><br />
        <b>Accounts</b><br />
        By creating an account on our website, you agree to provide accurate and complete information and to keep your account credentials secure. You are solely responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.<br /><br />
        <b>Content</b><br />
        Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.<br />
        By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.<br /><br />
        <b>Links To Other Web Sites</b><br />
        Our Service may contain links to third-party web sites or services that are not owned or controlled by Forums.<br />
        Forums has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that Forums shall not be responsible or liable, directly or indirectly, for any damage or loss<br /><br />
        <b>Developers</b><br />
        Forums has engaged developers to create and maintain the Service. While every effort is made to ensure the accuracy and functionality of the Service, Forums cannot guarantee the absence of errors or interruptions in service. By using the Service, you acknowledge that developers may have access to your personal information to the extent necessary to perform their duties, and you consent to such access.<br />
        Developers may periodically update or modify the Service, including adding or removing features, without prior notice. Forums reserves the right to monitor the performance of developers and to terminate their services if necessary.<br />
        Forums shall not be liable for any damages, losses, or claims arising from the actions or omissions of developers, including but not limited to errors, bugs, or breaches of security. Any disputes or concerns regarding the Service should be directed to Forums.<br />
        By using the Service, you agree to indemnify and hold harmless Forums and its developers from any liability, damages, or expenses incurred as a result of your use of the Service or your violation of these terms and conditions.
      </Typography>
    </Box>
  );

  const privacyBody = (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        <b>Privacy Policy</b>
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        <b>Last updated: 25th April, 2024</b><br />
        forums ("us", "we", or "our") operates http:\\14.239.189.217 (the "Site"). This page informs you of our policies regarding the collection, use, and disclosure of Personal Information we receive from users of the Site.<br /><br />
        <b>Information Collection and Use</b><br />
        While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name ("Personal Information") and email address.<br /><br />
        <b>Log Data</b><br />
        Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages, and other statistics.<br /><br />
        <b>Communications</b><br />
        We may use your Personal Information to contact you with newsletters, marketing, or promotional materials and other information that pertains to your interactions with our Site. You may opt-out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.<br /><br />
        <b>Cookies</b><br />
        Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.<br />
        Like many sites, we use "cookies" to collect information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Site.<br /><br />
        <b>Security</b><br />
        The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.<br /><br />
        <b>Changes to This Privacy Policy</b><br />
        This Privacy Policy is effective as of 25th April 2024 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.<br />
        We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.<br />
        If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website.<br /><br />
        <b>Contact Us</b><br />
        If you have any questions about this Privacy Policy, please contact us.
      </Typography>
    </Box>
  );

  const contactBody = (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        <b>Contact Us</b>
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        <b>Thank you for your interest in Forums!</b> If you have any questions, feedback, or inquiries regarding event management in our college communities, please don't hesitate to reach out to us. We're here to assist you in any way we can.<br /><br />
        <b>Our Team</b><br />
        Karthik Vijay: <a href="https://www.linkedin.com/in/karthikvijay5227/" className="cursor-pointer underline">LinkedIn Profile</a> - <a href="https://github.com/karthikvijay5227" className="cursor-pointer underline">Github Profile</a><br />
        Full Stack Web Developer, React Native Developer, Network Enthusiast<br /><br />
        R Ashwin: <a href="https://www.linkedin.com/in/ashu-r7/" className="cursor-pointer underline">LinkedIn Profile</a> - <a href="https://github.com/ashwin417" className="cursor-pointer underline">Github Profile</a><br />
        Cyberscurity, Pentester<br /><br />
        Sanjay Mathew: <a href="https://www.linkedin.com/in/sanjay-mathew34/" className="cursor-pointer underline">LinkedIn Profile</a> - <a href="https://github.com/M3BIONIX" className="cursor-pointer underline">Github Profile</a><br />
        React Native Developer<br /><br />
        <b>Description</b><br />
        Forums is a website dedicated to facilitating event management across all communities within our college. Whether you're a student, community leader, or college administrator, Forums provides a centralized platform for organizing, coordinating, and participating in various events. Our mission is to foster collaboration, engagement, and inclusivity among all members of the college community.<br /><br />
        <b>Contact Information</b><br />
        If you have any questions, suggestions, or concerns related to event management on our platform, please feel free to contact us via email at <a href="mailto:webmaster@ceconline.edu" className="text-blue-500">webmaster@ceconline.edu</a>. We value your input and are committed to enhancing your event management experience.
      </Typography>
    </Box>
  );

  const aboutBody = (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        <b>About</b>
      </Typography>
      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
        Forums is a website dedicated to facilitating event management across all communities within our college. Whether you're a student, community leader, or college administrator, Forums provides a centralized platform for organizing, coordinating, and participating in various events. Our mission is to foster collaboration, engagement, and inclusivity among all members of the college community.<br /><br />
        <b>Contact Information</b><br />
        If you have any questions, suggestions, or concerns related to event management on our platform, please feel free to contact us via email at <a href="mailto:webmaster@ceconline.edu" className="text-blue-500">webmaster@ceconline.edu</a>. We value your input and are committed to enhancing your event management experience.
      </Typography>
    </Box>
  );

  return (
    <Container>
      <footer className="bg-white rounded-lg shadow m-4 body-font">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8 text-center">
          <div className="sm:flex sm:items-center sm:justify-center">
            <div className="flex items-center justify-center">
              <img
                src="/assets/authlogo.png"
                className="h-7"
                alt="Forums CEC"
              />
              <Typography variant="body2" color="text.primary" className="self-center text-2xl mt-[0.2rem] font-semibold whitespace-nowrap ml-3 dark:text-black">Forums CEC</Typography>
            </div>
          </div>
          <ul className="flex flex-wrap mt-[1.5rem] items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 justify-center"> {/* Added justify-center */}
            <li>
              <a className="hover:underline me-4 md:me-6 cursor-pointer" onClick={handleAboutOpen}>
                About
              </a>
            </li>
            <li>
              <a className="hover:underline me-4 md:me-6 cursor-pointer" onClick={handlePrivacyOpen}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="hover:underline me-4 md:me-6 cursor-pointer" onClick={handleTermsOpen}>
                Terms and Conditions
              </a>
            </li>
            <li>
              <a className="hover:underline cursor-pointer" onClick={handleContactOpen}>
                Contact
              </a>
            </li>
          </ul>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center">
            © 2024{" "}
            <span>
              Forums CEC
            </span>
            . All Rights Reserved.
          </span>
        </div>
        <Modal
          open={termsOpen}
          onClose={handleTermsClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {termsBody}
        </Modal>
        <Modal
          open={privacyOpen}
          onClose={handlePrivacyClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {privacyBody}
        </Modal>
        <Modal
          open={contactOpen}
          onClose={handleContactClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {contactBody}
        </Modal>
        <Modal
          open={aboutOpen}
          onClose={handleAboutClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {aboutBody}
        </Modal>
      </footer>
    </Container>
  );
}
