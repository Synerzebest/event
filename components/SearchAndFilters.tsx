"use client"

import React, { useState, useEffect, useRef } from 'react';
import { LuSlidersHorizontal } from "react-icons/lu";
import { IoMdClose } from 'react-icons/io';
import { Event } from "@/types/types";
import { Select, Spin } from 'antd';
import { FaMagnifyingGlass } from "react-icons/fa6";
import useFirebaseUser from '@/lib/useFirebaseUser';
import { EventComponent } from '.';

const { Option } = Select;

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
    const [likedEvents, setLikedEvents] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedLikedEvents = localStorage.getItem('likedEventIds');
            if (storedLikedEvents) {
                setLikedEvents(JSON.parse(storedLikedEvents));
            }
        }
    }, []);

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
        <div className="relative top-12 w-11/12 mx-auto p-4 bg-white rounded-lg mb-8">
            <div 
                className="w-full md:w-2/3 lg:w-1/2 flex items-center justify-between bg-white p-4 rounded-full shadow-lg mx-auto"
            >
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for events..."
                    className="w-full px-4 py-3 border-none bg-gray-100 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out"
                />
                <button
                    onClick={handleSearch}
                    className="ml-4 p-3 text-white bg-blue-500 rounded-full shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out"
                >
                    <FaMagnifyingGlass size={18} />
                </button>
                <button
                    onClick={toggleFilters}
                    className="ml-2 p-3 text-white bg-gray-500 rounded-full shadow-md hover:bg-gray-600 hover:shadow-lg transition duration-300 ease-in-out"
                >
                    {showFilters ? <IoMdClose size={18} /> : <LuSlidersHorizontal size={18} />}
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
                            onDropdownVisibleChange={handleDropdownVisibleChange} // Écouteur pour la visibilité du dropdown
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
