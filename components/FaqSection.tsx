"use client"

import React, { useState } from 'react';

const faqData = [
    {
        question: "How can I create an event?",
        answer: "To create an event, simply click on the 'Create Event' button on the dashboard and follow the on-screen instructions to enter the necessary details, such as event name, date, and venue."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use state-of-the-art encryption protocols to ensure your data remains confidential and secure at all times. We also perform regular backups to protect against data loss."
    },
    {
        question: "Can I invite guests via email?",
        answer: "Yes, you can easily send invitations to your guests via email. You can even customize the invitation with your own branding or choose from our various templates."
    },
    {
        question: "How can I track RSVPs?",
        answer: "Once your invitations are sent, you can track RSVP responses in real-time from your event management dashboard. You’ll also receive notifications when someone responds."
    },
    {
        question: "What if I need help with my event?",
        answer: "Our support team is available 24/7 to assist you. You can contact us through live chat, email, or phone for any help you need regarding event setup or management."
    }
];

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-white relative top-64">
            <div className="container mx-auto">
                {/* Title */}
                <h2 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                <p className="text-center text-lg text-gray-600 mb-12">
                    Find answers to common questions about EventEase.
                </p>

                {/* FAQ Items */}
                <div className="max-w-3xl sm:mx-auto mx-4">
                    {faqData.map((item, index) => (
                        <div key={index} className="mb-4 border-b border-gray-200">
                            {/* Question */}
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full text-left p-4 bg-gray-100 font-medium text-xl flex justify-between items-center focus:outline-none"
                            >
                                {item.question}
                                <span>{activeIndex === index ? '-' : '+'}</span>
                            </button>

                            {/* Answer */}
                            {activeIndex === index && (
                                <div className="p-4 bg-white text-gray-600">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
