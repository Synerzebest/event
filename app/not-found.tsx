"use client"

import { motion } from "framer-motion";
import Link from "next/link";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
            <motion.h1
                className="text-7xl font-bold text-red-500"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                404
            </motion.h1>

            <motion.h2
                className="text-2xl mt-4 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                Whoops! Looks like this page doesn&apos;t exist.
            </motion.h2>

            <motion.p
                className="text-lg mt-2 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                It seems like you&apos;re off track. Don&apos;t worry, we&apos;ll help you get back to the event!
            </motion.p>

            <motion.div
                className="mt-8 flex space-x-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Back Home
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
