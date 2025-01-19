"use client"

import { useSearchParams } from "next/navigation";
import { Navbar, EventComponent, Footer } from '@/components';
import useFirebaseUser from "@/lib/useFirebaseUser";
import Link from "next/link";
import { motion } from "framer-motion";
import useLanguage from "@/lib/useLanguage";

const PaymentSuccess = () => {
    const lng = useLanguage();
    const searchParams = useSearchParams();
    const eventId = searchParams ? searchParams.get('eventId') : null;
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";

    return (
        <>
            <Navbar lng={lng} />
                <motion.div
                className="w-11/12 md:w-[80%] relative top-12 mx-auto p-6 border border-gray-300 rounded-lg shadow-xl bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100"
                initial={{ opacity: 0, y: 50 }} // Animation d'entrée avec un mouvement vers le haut
                animate={{ opacity: 1, y: 0 }} // Animation d'arrivée à la position finale
                transition={{ duration: 0.8, ease: "easeOut" }} // Durée de l'animation
            >
                <motion.h1
                    className="text-3xl font-extrabold text-green-600 text-center"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Everything went well!
                </motion.h1>
                <motion.p
                    className="mt-4 text-lg text-gray-700 font-semibold text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    Thanks for your trust
                </motion.p>

                <motion.div
                    className="mt-8 p-6 rounded-lg flex flex-col items-center bg-white shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                >
                    <motion.h2
                        className="text-xl font-semibold mb-6 text-gray-800"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Event details
                    </motion.h2>

                    {/* Composant EventComponent affiché avec une animation d'entrée */}
                    <EventComponent eventId={eventId!} userId={userId} participateButton={false} />
                </motion.div>

                <motion.div
                    className="mt-6 mb-4"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <Link href="/" passHref>
                        <motion.button
                            className="bg-blue-500 text-white font-bold py-4 px-6 rounded-lg text-xl hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Back Home
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
            <Footer />
        </>
    );
};

export default PaymentSuccess;
