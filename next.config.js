/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true, // Skip linting during build
    },
};

module.exports = nextConfig;
