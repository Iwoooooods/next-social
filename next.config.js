 /** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      staleTimes: {
        dynamic: 30,
      },
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "utfs.io",
          pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
        },
      ],
    },
  };
  
  module.exports = nextConfig;