import React from 'react';

const page = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Transaction Canceled</h1>
                <p className="text-gray-600 mb-6">
                    We&apos;re sorry to see that you&apos;ve canceled your transaction. If you have any questions, please feel free to contact us.
                </p>
                <div className="mt-6">
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    >
                        Return to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default page;
