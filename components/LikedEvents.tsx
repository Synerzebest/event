'use client';

import { useEffect, useState, useRef } from 'react';
import { Carousel, Skeleton } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import EventComponent from './EventComponent';
import Image from 'next/image';
import useLanguage from '@/lib/useLanguage';
import { useTranslation } from '@/app/i18n';
import { safeTranslate } from '@/lib/utils';

const no_event_image = "/images/no_favorite.png";

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return isMobile;
}

interface LikedEventsProps {
  userId: string;
}

const LikedEvents: React.FC<LikedEventsProps> = ({ userId }) => {
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<CarouselRef>(null);
  const lng = useLanguage();
  const { t } = useTranslation(lng, 'common');
  const isMobile: boolean = useIsMobile();

  useEffect(() => {
    if (!userId) return;

    const fetchLikedEvents = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (res.ok && data.likedEvents) {
          setLikedEventIds(data.likedEvents);
        }
      } catch (err) {
        console.error("Error fetching liked events:", err);
      } finally {
        setLoading(false);
        console.log(likedEventIds)
      }
    };

    fetchLikedEvents();
  }, [userId]);

  return (
    <>
      <div className="w-full mx-auto overflow-hidden">
        {loading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-[350px] flex-shrink-0 bg-white p-4 rounded-lg">
                <Skeleton.Image style={{ width: '100%', height: 200 }} />
                <div className="mt-4">
                  <Skeleton active paragraph={{ rows: 2 }} />
                  <Skeleton.Button style={{ marginTop: 16 }} />
                </div>
              </div>
            ))}
          </div>
        ) : likedEventIds.length === 0 ? (
          <div className="w-full flex flex-col items-center text-center p-6 rounded-lg">
            <Image
              src={no_event_image}
              alt="no liked events"
              className="w-auto max-h-36 h-full mb-4"
              width={500}
              height={200}
            />
            <p className="text-gray-700 text-xl font-semibold">
              {safeTranslate(t, 'no_favorite_events')}
            </p>
          </div>
        ) : isMobile ? (
          <>
            <Carousel
              dots={false}
              infinite={false}
              ref={carouselRef}
            >
              {likedEventIds.map((id) => (
                <EventComponent key={id} eventId={id} userId={userId} participateButton={true} />
              ))}
            </Carousel>
            <div className="flex justify-center gap-4 my-4">
                <button onClick={() => carouselRef.current?.prev()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronLeft size={24} />
                </button>
                <button onClick={() => carouselRef.current?.next()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronRight size={24} />
                </button>
              </div>
          </>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {likedEventIds}
          </div>
        )}
      </div>
    </>
  );
};

export default LikedEvents;
