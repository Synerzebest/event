"use client"

import React, { useState, useEffect, useRef } from 'react';
import { LuSlidersHorizontal } from "react-icons/lu";
import { IoMdClose } from 'react-icons/io';
import { Event } from "@/types/types";
import { Select, Spin } from 'antd';
import useFirebaseUser from '@/lib/useFirebaseUser';
import { EventComponent } from '.';
import { useTranslation } from '@/app/i18n';
import useLanguage from '@/lib/useLanguage';
import { FaSearch } from "react-icons/fa";
import { safeTranslate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const categories = [
    { value: "music", label: "Music" },
    { value: "art", label: "Art" },
    { value: "theater", label: "Theater" },
    { value: "food", label: "Food" },
    { value: "sports", label: "Sports" },
    { value: "festival", label: "Festival" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "charity", label: "Charity" },
    { value: "family", label: "Family" },
    { value: "networking", label: "Networking" },
    { value: "outdoor", label: "Outdoor" },
    { value: "community", label: "Community" },
    { value: "wellness", label: "Wellness" },
    { value: "tech", label: "Technology" },
    { value: "holiday", label: "Holiday" },
    { value: "party", label: "Party" }
];

const SearchAndFilters = () => {
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    const [initialSearchDone, setInitialSearchDone] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!searchParams) return;
        const queryCity = searchParams.get("city");

        if (queryCity && !initialSearchDone) {
            setInitialSearchDone(true);

            setTimeout(() => {
            handleSearch(queryCity);
            }, 100);
        }
    }, [searchParams, initialSearchDone]);

      

    // Handle event search
    const handleSearch = async (term?: string) => {
        setLoading(true);
        try {
          const queryParams = new URLSearchParams();
      
          if (term || searchTerm) {
            queryParams.append("searchTerm", term ?? searchTerm);
          }
      
          if (category) {
            queryParams.append("category", category);
          }
      
          const response = await fetch(`/api/events/search?${queryParams}`, {
            method: 'GET',
          });
      
          if (!response.ok) {
            throw new Error('Error fetching events');
          }
      
          const data: Event[] = await response.json();
          setEvents(data);
          setHasSearched(true);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching events", error);
        }
    };
      

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Vérifiez si le clic est en dehors du conteneur des filtres et du dropdown
            if (filterRef.current && !filterRef.current.contains(target) && !dropdownVisible) {
                setShowFilters(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownVisible]);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleDropdownVisibleChange = (visible: boolean) => {
        setDropdownVisible(visible);
    };

    return (
        <div className="relative top-24 w-11/12 mx-auto rounded-2xl mb-8">
            <div className="w-full md:w-2/3 lg:w-1/2 flex items-center bg-white border border-gray-200 p-1.5 rounded-full shadow-md backdrop-blur-sm mx-auto transition-all duration-300">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    placeholder={safeTranslate(t, 'search_placeholder')}
                    className="w-full px-3 py-1.5 bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
                <button
                    onClick={() => handleSearch()}
                    className="ml-1.5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200"
                >
                    <FaSearch size={16} className="text-gray-600" />
                </button>
                <button
                    onClick={toggleFilters}
                    className="ml-1 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200"
                >
                    {showFilters ? (
                        <IoMdClose size={16} className="text-gray-600" />
                    ) : (
                        <LuSlidersHorizontal size={16} className="text-gray-600" />
                    )}
                </button>
            </div>

            {showFilters && (
                <div ref={filterRef} className="absolute left-1/2 mt-4 translate-x-[-50%] w-[275px] bg-white border border-gray-200 p-4 rounded-xl shadow-lg">
                    <div className="flex justify-center">
                        <Select
                            className="w-11/12 mx-auto"
                            showSearch
                            placeholder="Category"
                            optionFilterProp="label"
                            onChange={(value) => { setCategory(value) }}
                            onDropdownVisibleChange={handleDropdownVisibleChange}
                            options={categories}
                        />
                    </div>
                </div>
            )}

                <div className="w-full mx-auto flex flex-col gap-8 mt-8">
                    {loading ? (
                    <div className="w-full mt-8 flex justify-center">
                        <Spin />
                    </div>
                    ) : (
                    <>
                        {hasSearched && (
                        <div className="w-full mt-4 text-2xl font-bold text-gray-800 sm:text-start text-center">
                            {safeTranslate(t, "search_result")} ({events.length})
                        </div>
                        )}

                        <div className="w-full flex flex-row flex-wrap gap-4 justify-center md:justify-start">
                        {events.map((event) => (
                            <EventComponent key={event.id} eventId={event.id} userId={userId} participateButton={true} />
                        ))}
                        </div>
                    </>
                    )}
                </div>
            </div>
    );
};

export default SearchAndFilters;
