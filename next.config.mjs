/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let three's ESM ecosystem transpile cleanly
  transpilePackages: ['three'],
};

export default nextConfig;
