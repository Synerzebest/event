"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Spin } from "antd";
import Image from "next/image";
import { Navbar, Footer } from "@/components";
import { MapPin, Calendar } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { Event } from "@/types/types";
import { HiUserGroup } from "react-icons/hi2";
import { safeTranslate } from "@/lib/utils";
import { format } from "date-fns";

interface PageProps {
  params: { lng: string };
}

const Page = ({ params: { lng } }: PageProps) => {
  const { eventId } = useParams() as { eventId: string };
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation(lng, "common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const response = await fetch(`/api/getEventById/${eventId}`);
        const data = await response.json();
        if (response.ok) setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (i18n) setIsLoading(false);
  }, [i18n]);

  const handleParticipateClick = async () => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      await router.push(`/event/${event.id}/participate`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || loading)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent">
        <motion.div
          className="text-4xl font-extrabold text-indigo-500"
          animate={{
            color: ["#818cf8", "#4f46e5", "#818cf8"], // indigo-400 → indigo-600 → indigo-400
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          EaseEvent
        </motion.div>
      </div>
 );


  if (!event)
    return (
      <>
        <Navbar lng={lng} />
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Nothing to see here 👀
        </div>
        <Footer />
      </>
    );

  const isPastEvent = new Date(event.date) < new Date();
  const formattedDate = format(event.date, "dd MMMM yyyy");

  return (
    <>
      <Navbar lng={lng} />

      {/* --- HERO --- */}
      <section className="relative top-[4.4rem] sm:top-20 w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <Image
          src={event.images?.[0] || "/placeholder-event.jpg"}
          alt={event.title}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 text-center flex flex-col items-center text-gray-900 px-6 max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-indigo-500">
            {event.title}
          </h1>

          <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span>
                {event.place} - {event.city}
              </span>
            </div>
          </div>

          <motion.button
            disabled={isPastEvent || isSubmitting}
            onClick={handleParticipateClick}
            className={`px-8 py-3 rounded-full transition-all shadow-md font-semibold flex items-center justify-center gap-2 ${
              isPastEvent || isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:opacity-90"
            }`}
          >
            {isSubmitting ? (
              <>
                {safeTranslate(t, "participate")}
                <Spin size="small" />
              </>
            ) : isPastEvent ? (
              safeTranslate(t, "event_expired")
            ) : (
              safeTranslate(t, "participate")
            )}
          </motion.button>
        </motion.div>
      </section>

      {/* --- CONTENT --- */}
      <main className="relative z-20 bg-white -mt-10 rounded-t-3xl shadow-[0_-8px_24px_rgba(79,70,229,0.05)] pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-16 space-y-12">
          {/* --- INFO --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              {safeTranslate(t, "about")}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description || safeTranslate(t, "no_description")}
            </p>
          </motion.div>

          {/* --- STATS --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 border border-gray-100 p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <HiUserGroup className="text-indigo-500 w-7 h-7" />
              <p className="text-gray-700 font-medium">
                {event.currentGuests ?? 0} / {event.guestLimit} {safeTranslate(t, "participants")}
              </p>
            </div>
            <motion.button
              whileHover={!isSubmitting && !isPastEvent ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting && !isPastEvent ? { scale: 0.97 } : {}}
              disabled={isSubmitting || isPastEvent}
              onClick={handleParticipateClick}
              className={`px-8 py-3 rounded-full font-semibold shadow-sm transition flex items-center justify-center gap-2 ${
                isPastEvent || isSubmitting
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 text-white hover:opacity-90"
              }`}
            >
              {isSubmitting ? (
                <>
                  {safeTranslate(t, "participate")}
                  <Spin size="small" />
                </>
              ) : (
                safeTranslate(t, "participate")
              )}
            </motion.button>
          </motion.div>

          {/* --- CTA FINAL --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center flex flex-col items-center bg-gradient-to-b from-indigo-400 to-indigo-600 text-white py-12 px-6 rounded-3xl shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-4">
              {safeTranslate(t, "join_now")} 🎉
            </h2>
            <p className="mb-6 text-lg opacity-90">
              {safeTranslate(t, "join_event_subtitle")}
            </p>
            <button
              disabled={isSubmitting || isPastEvent}
              onClick={handleParticipateClick}
              className="px-8 py-3 bg-white text-indigo-700 rounded-full font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  {safeTranslate(t, "participate")}
                  <Spin size="small" />
                </>
              ) : (
                <>
                    {safeTranslate(t, "join_event_cta")}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Page;
