import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Container>
      <footer className="text-gray-600 body-font">
        <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
          <div className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <img src="/assets/authlogo.png" width={90} />
            <Typography variant="body2" color="text.primary" className="ml-3 text-xl">Forums CEC</Typography>
          </div>
          <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">© 2024 Forums CEC</p>
        </div>
      </footer>
    </Container>
  );
}
