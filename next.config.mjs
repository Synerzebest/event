const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    reactStrictMode: false,
    env: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    },
};

export default nextConfig;
