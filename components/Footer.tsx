"use client"

import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import useLanguage from '@/lib/useLanguage';
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from '@/lib/utils';

const Footer = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common")
    const date = new Date();
    const year = date.getFullYear();
    return (
        <footer className="relative top-24 bg-white text-gray-700 py-12 px-6 w-full mt-24 border-t border-gray-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
                {/* Section 1: Company Logo and Info */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <h2 className="text-3xl font-extrabold text-gray-900">EaseEvent</h2>
                <p className="text-gray-600 text-sm max-w-xs">
                    {safeTranslate(t, "footer_content")}
                </p>
                </div>

                {/* Section 2: Navigation Links */}
                <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{safeTranslate(t, "quick_links")}</h3>
                <ul className="space-y-2">
                    <li className="text-gray-600 text-sm">
                    contact@easeevent.be
                    </li>
                    <li>
                    <Link href={`/${lng}/terms-and-conditions`} className="text-gray-600 text-sm hover:text-indigo-500 transition">
                        {safeTranslate(t, "terms_and_conditions")}
                    </Link>
                    </li>
                    <li>
                    <Link href={`/${lng}/privacy-policy`} className="text-gray-600 text-sm hover:text-indigo-500 transition">
                        {safeTranslate(t, "privacy_policy")}
                    </Link>
                    </li>
                    <li>
                    <Link href="/" className="text-gray-600 text-sm hover:text-indigo-500 transition">
                        FAQ
                    </Link>
                    </li>
                </ul>
                </div>

                {/* Section 3: Social Media Links */}
                <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Follow Us</h3>
                <div className="flex space-x-4">
                    <Link href="https://facebook.com" className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 transition">
                    <FaFacebookF size={18} className="text-indigo-500" />
                    </Link>
                    <Link href="https://twitter.com" className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 transition">
                    <FaTwitter size={18} className="text-indigo-500" />
                    </Link>
                    <Link href="https://instagram.com" className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 transition">
                    <FaInstagram size={18} className="text-indigo-500" />
                    </Link>
                    <Link href="https://linkedin.com" className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 transition">
                    <FaLinkedinIn size={18} className="text-indigo-500" />
                    </Link>
                </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 text-center border-t border-gray-200 pt-6">
                <p className="text-xs text-gray-500">
                © {year} EaseEvent. All Rights Reserved.
                </p>
            </div>
            </footer>

    );
};

export default Footer;
