import React from 'react';
import Image from 'next/image';

const testimonials = [
    {
        name: "Karl Johnson",
        title: "Event Planner",
        content: "EventEase has revolutionized how I manage my events. Everything is so streamlined and easy to use!",
        image: "/images/user1.jpeg"
    },
    {
        name: "Michael Lee",
        title: "Wedding Coordinator",
        content: "I love how I can customize everything for my clients. It saves me hours of work!",
        image: "/images/user3.jpeg"
    },
    {
        name: "Sara Martinez",
        title: "Corporate Events Manager",
        content: "The budget management tool is a lifesaver. I no longer have to worry about overspending!",
        image: "/images/user2.jpeg"
    }
]

const Testimonials = () => {
    return (
        <div className="py-20 relative top-64">
            <h2 className="text-center text-4xl font-bold mb-12">What Our Users Say</h2>
            
            <div className="flex flex-wrap justify-center gap-8">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="max-w-sm w-full lg:w-1/3 p-4 hover:scale-105 duration-300">
                        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-xl">{testimonial.name}</h3>
                                <p className="text-sm text-gray-500">{testimonial.title}</p>
                                <p className="mt-4 text-gray-700 italic">"{testimonial.content}"</p>
                            </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonials
