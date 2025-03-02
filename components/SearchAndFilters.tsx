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

    // Handle event search
    const handleSearch = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                searchTerm,
                category,
            });

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
        setDropdownVisible(visible); // Mettez à jour la visibilité du dropdown
    };

    return (
        <div className="relative top-36 w-11/12 mx-auto p-4 rounded-lg mb-8">
            <div className="w-full md:w-2/3 lg:w-1/2 flex items-center bg-indigo-500 text-white p-3 rounded-full shadow-xl backdrop-blur-md mx-auto transition-all duration-300">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={safeTranslate(t, 'search_placeholder')}
                    className="w-full px-4 py-2 bg-transparent border-none focus:outline-none text-white placeholder-gray-100"
                />
                <button
                    onClick={handleSearch}
                    className="ml-3 p-3 bg-indigo-600 rounded-full hover:bg-indigo-700 transition duration-300"
                >
                    <FaSearch size={20} />
                </button>
                <button
                    onClick={toggleFilters}
                    className="ml-2 p-3 bg-indigo-600 rounded-full hover:bg-indigo-700 transition duration-300"
                >
                    {showFilters ? <IoMdClose size={20} /> : <LuSlidersHorizontal size={20} />}
                </button>
            </div>

            {showFilters && (
                <div ref={filterRef} className="absolute left-1/2 translate-x-[-50%] w-[275px] mt-4 bg-gray-50 p-4 rounded-lg shadow-lg">
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
                            <div className="w-full mt-4 text-2xl font-bold sm:text-start text-center">
                                {events.length} {events.length === 1 || events.length === 0 ? 'Event' : 'Events'} Found
                            </div>
                        )}

                        <div className="w-full flex flex-row flex-wrap gap-4">
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
