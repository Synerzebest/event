import React from 'react';
import Link from 'next/link';

const PricingTable = () => {
    return (
        <div className="bg-gray-100 py-20 relative top-64">
            <h2 className="text-center text-4xl font-bold mb-12">Choose Your Plan</h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Basic Plan */}
                <div className="w-[95%] md:w-1/4 bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200 hover:shadow-xl duration-200">
                    <h3 className="text-2xl font-bold mb-4">Free</h3>
                    <p className="text-4xl font-bold mb-4">0€<span className="text-lg">/mo</span></p>
                    <p className="text-gray-500 mb-8">For small events</p>
                    <ul className="text-gray-600 mb-8">
                        <li className="mb-2">Up to 2 events per month</li>
                        <li className="mb-2">RSVP Tracking</li>
                        <li className="mb-2">Basic Support</li>
                    </ul>
                    <Link href="/signup" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">Choose Plan</Link>
                </div>

                {/* Standard Plan - Most Popular */}
                <div className="w-[95%] md:w-1/4 bg-white rounded-lg shadow-lg p-8 text-center border-2 border-blue-500 hover:shadow-xl duration-200">
                    <h3 className="text-2xl font-bold mb-4">Standard</h3>
                    <p className="text-4xl font-bold mb-4">10€<span className="text-lg">/mo</span></p>
                    <p className="text-gray-500 mb-8">For growing events</p>
                    <ul className="text-gray-600 mb-8">
                        <li className="mb-2">Up to 10 events per month</li>
                        <li className="mb-2">Custom Invitations</li>
                        <li className="mb-2">RSVP + Budget Tracking</li>
                        <li className="mb-2">Priority Support</li>
                    </ul>
                    <Link href="/signup" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">Choose Plan</Link>
                </div>

                {/* Pro Plan */}
                <div className="w-[95%] md:w-1/4 bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200 hover:shadow-xl duration-200">
                    <h3 className="text-2xl font-bold mb-4">Pro</h3>
                    <p className="text-4xl font-bold mb-4">20€<span className="text-lg">/mo</span></p>
                    <p className="text-gray-500 mb-8">For large events</p>
                    <ul className="text-gray-600 mb-8">
                        <li className="mb-2">Unlimited events</li>
                        <li className="mb-2">Full Event Analytics</li>
                        <li className="mb-2">Collaborative Planning</li>
                        <li className="mb-2">Dedicated Support</li>
                    </ul>
                    <Link href="/signup" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">Choose Plan</Link>
                </div>
            </div>
        </div>
    )
}

export default PricingTable;
