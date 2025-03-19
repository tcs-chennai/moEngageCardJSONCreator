/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/wysiwyg-editor' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/wysiwyg-editor/' : '',
};

export default nextConfig;
