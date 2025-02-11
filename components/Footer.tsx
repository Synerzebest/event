import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    const date = new Date();
    const year = date.getFullYear();
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 mx-4 mb-[16.5rem] rounded-xl relative top-64">
            <div className="container mx-auto flex flex-wrap justify-between items-start space-y-8 md:space-y-0">
                {/* Section 1: Company Logo and Info */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-4">EventEase</h2>
                    <p className="text-gray-400">
                        Simplifying event management and making your events a success.
                    </p>
                </div>

                {/* Section 2: Navigation Links */}
                <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/about" className="hover:text-gray-100 transition duration-300">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="/pricing" className="hover:text-gray-100 transition duration-300">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" className="hover:text-gray-100 transition duration-300">
                                FAQ
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-gray-100 transition duration-300">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Section 3: Social Media Links */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-end text-center md:text-right">
                    <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <Link href="https://facebook.com" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition duration-300">
                            <FaFacebookF size={20} className="text-white" />
                        </Link>
                        <Link href="https://twitter.com" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition duration-300">
                            <FaTwitter size={20} className="text-white" />
                        </Link>
                        <Link href="https://instagram.com" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition duration-300">
                            <FaInstagram size={20} className="text-white" />
                        </Link>
                        <Link href="https://linkedin.com" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition duration-300">
                            <FaLinkedinIn size={20} className="text-white" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 text-center border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-400">
                    © {year} EventEase. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
