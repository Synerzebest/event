import React from 'react';
import Image from "next/image";

const backup = "/images/backup.png";
const security = "/images/security.png";
const support = "/images/support.png";

const ReliabilitySection = () => {
    return (
        <section className="py-16 bg-gray-50 relative top-64">
            <div className="container mx-auto">
                {/* Title */}
                <h2 className="text-4xl font-bold text-center mb-8">Reliability & Security</h2>
                <p className="text-center text-lg text-gray-600 mb-12">
                    Your Events, Safely Managed. Every Time.
                </p>
                
                {/* Feature Cards */}
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Card 1 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={security} 
                            alt="Data protection image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">Data Protection</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            All your event data is protected with state-of-the-art encryption. We use advanced security protocols to ensure that your information remains confidential and secure.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={backup} 
                            alt="backup image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">Regular Backups</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            We perform regular backups of all your event data to ensure that nothing is ever lost. In case of any issues, your events are safely stored and can be restored instantly.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={support} 
                            alt="Support image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">24/7 Support</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            Our support team is available 24/7 to assist you with any issues. Whether it's a technical problem or a simple question, we're here to help you keep your events running smoothly.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ReliabilitySection;
