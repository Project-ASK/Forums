/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost','14.139.189.219'], // replace 'localhost' with your backend domain
  },
};

export default nextConfig;
