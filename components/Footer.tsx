import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 relative top-64">
            <div className="container mx-auto flex flex-wrap justify-between items-start space-y-8 md:space-y-0">
                {/* Section 1: Company Logo and Info */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">EventEase</h2>
                    <p className="text-gray-400">
                        Simplifying event management and making your events a success.
                    </p>
                </div>

                {/* Section 2: Navigation Links */}
                <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/about" className="hover:text-blue-400">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="/pricing" className="hover:text-blue-400">
                                Pricing
                            </Link>
                        </li>
                        <li>
                            <Link href="/faq" className="hover:text-blue-400">
                                FAQ
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:text-blue-400">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Section 3: Social Media Links */}
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-end text-center md:text-right">
                    <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <Link href="https://facebook.com" className="hover:text-blue-400">
                            <FaFacebookF size={24} />
                        </Link>
                        <Link href="https://twitter.com" className="hover:text-blue-400">
                            <FaTwitter size={24} />
                        </Link>
                        <Link href="https://instagram.com" className="hover:text-blue-400">
                            <FaInstagram size={24} />
                        </Link>
                        <Link href="https://linkedin.com" className="hover:text-blue-400">
                            <FaLinkedinIn size={24} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 text-center border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-500">
                    © 2024 EventEase. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
