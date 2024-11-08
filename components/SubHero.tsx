import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
    {
        title: "Event Management",
        description: "Easily create and manage your events from a single platform.",
        image: "/images/eventmanagment.png"
    },
    {
        title: "Event Planning",
        description: "Plan your events efficiently with our intuitive tools.",
        image: "/images/eventplanning.png"
    },
    {
        title: "Custom Invitations",
        description: "Send personalized invitations to your guests.",
        image: "/images/custominvitations.png"
    },
    {
        title: "RSVP Tracking",
        description: "Keep track of your guests' responses effortlessly.",
        image: "/images/rsvp.png"
    },
    {
        title: "Event Reminders",
        description: "Automatically send reminders to your guests before the event.",
        image: "/images/reminders.png"
    },
    {
        title: "Budget Management",
        description: "Stay on top of your event expenses with our budgeting tools.",
        image: "/images/budget.png"
    },
];

const SubHero = () => {
    return (
        <section className="py-16 bg-gray-50 relative top-60">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-8">Discover the Features of EventEase</h2>
                <p className="text-lg text-gray-600 mb-12 mx-4">Streamline your event planning process with our powerful tools designed for efficiency and ease of use.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.title} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-lg hover:bg-gray-50 duration-300 max-w-[95%] mx-auto ">
                            <h3 className="text-2xl font-semibold mb-2 pt-6">{feature.title}</h3>
                            <div className="relative h-32">
                                <Image src={feature.image} alt={feature.title} layout="fill" className="object-cover" style={{objectFit: "contain"}} />
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 mb-4">{feature.description}</p>
                                <Link href="/learn-more" className="text-blue-500 font-bold hover:underline">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SubHero;
