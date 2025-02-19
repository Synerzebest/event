import path from 'path';

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)", // Applique la règle à toutes les pages
                headers: [
                    {
                        key: "X-Robots-Tag",
                        value: "index, follow"
                    }
                ]
            }
        ];
    },
    reactStrictMode: false,
    env: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        GOOGLE_ADSENSE_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@": path.resolve("./"),
        };
        return config;
    },
};

export default nextConfig;
