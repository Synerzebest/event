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

interface LikedEventsProps {
  userId: string;
}

const LikedEvents: React.FC<LikedEventsProps> = ({ userId }) => {
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<CarouselRef>(null);
  const lng = useLanguage();
  const { t } = useTranslation(lng, 'common');

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
      }
    };

    fetchLikedEvents();
  }, [userId]);

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8 text-center sm:text-start">
        {safeTranslate(t, 'favorite_events')}
      </h2>

      <div className="w-[97%] sm:w-full mx-auto bg-white border border-gray-200 p-6 rounded-2xl shadow-md overflow-hidden">
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
            <p className="text-white text-xl font-semibold">
              {safeTranslate(t, 'no_favorite_events')}
            </p>
          </div>
        ) : (
          <>
            <Carousel
              dots={false}
              infinite={false}
              ref={carouselRef}
              slidesToShow={1}
              responsive={[
                { breakpoint: 640, settings: { slidesToShow: 1 } },
                { breakpoint: 768, settings: { slidesToShow: 2 } },
                { breakpoint: 1024, settings: { slidesToShow: 3 } },
              ]}
            >
              {likedEventIds.map((id) => (
                <div key={id} className="px-2 mb-2">
                  <EventComponent eventId={id} userId={userId} participateButton={true} />
                </div>
              ))}
            </Carousel>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => carouselRef.current?.prev()}
                className="bg-white text-black shadow p-2 rounded-full border hover:shadow-md transition"
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                onClick={() => carouselRef.current?.next()}
                className="bg-white text-black shadow p-2 rounded-full border hover:shadow-md transition"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LikedEvents;
