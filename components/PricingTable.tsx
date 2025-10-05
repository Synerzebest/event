"use client"

import React, { useEffect, useState } from "react";
import { useTranslation } from "../app/i18n";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { fetchStripeSubscriptionStatus } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import { safeTranslate } from "@/lib/utils";

import {
    HiUserGroup,
    HiChartBar,
    HiChatBubbleLeftRight,
    HiTicket,
    HiBanknotes
} from "react-icons/hi2";

type PlanType = "STARTER" | "STANDARD" | "PRO";

const priceIds: Record<PlanType, string | undefined> = {
    STARTER: process.env.NEXT_PUBLIC_PRICE_ID_STARTER,
    STANDARD: process.env.NEXT_PUBLIC_PRICE_ID_STANDARD,
    PRO: process.env.NEXT_PUBLIC_PRICE_ID_PRO,
};

const PricingTable = ({ lng }: { lng: "en" | "fr" | "nl" }) => {
    const { t } = useTranslation(lng, "common");
    const { user } = useFirebaseUser();
    const router = useRouter();
    const [activePlan, setActivePlan] = useState<PlanType>("STARTER"); // STARTER par défaut

    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            if (user?.stripeCustomerId) {
                const planType = await fetchStripeSubscriptionStatus(user.stripeCustomerId);
                setActivePlan(planType); // Si pas d’abonnement, planType = "STARTER"
            }
        };
        checkSubscriptionStatus();
        console.log(activePlan)
    }, [user]);

    const handleSubscribe = async (priceId: string) => {
        if (!user) {
            router.push(`/${lng}/auth/signin`);
            return;
        }
    
        try {    
            const response = await fetch("/api/create-subscription-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.uid,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || "Une erreur est survenue.");
            }
    
            window.location.href = data.url;
    
        } catch (error) {
            console.error("❌ Erreur lors de la souscription :", error);
        }
    };
    

    return (
        <div className="py-20 relative top-0">
            <h2 className="text-center text-[1.7rem] sm:text-4xl font-bold mb-12">{safeTranslate(t, 'choose_plan')}</h2>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {["Starter", "Standard", "Pro"].map((plan) => {
                    const planType = plan.toUpperCase() as PlanType;
                    const isStandard = plan === "Standard";

                    return (
                        <div
                            key={planType}
                            className={`relative w-[95%] lg:w-1/4 rounded-2xl p-8 text-center border 
                                transition-all duration-300 transform ${
                                isStandard
                                    ? "bg-white border-indigo-500 border-2 shadow-xl hover:shadow-2xl"
                                    : "bg-gray-50 border-gray-300 shadow-lg hover:shadow-2xl"
                                }`}
                        >
                            {isStandard && (
                                <span className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {safeTranslate(t, 'famous')}
                                </span>
                            )}

                            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{plan}</h3>

                            <p className="text-5xl font-bold text-gray-900 mb-4">
                                {plan === "Starter" ? "0€" : plan === "Standard" ? "12.99€" : "29.99€"}
                                <span className="text-lg text-gray-500">/mo</span>
                            </p>

                            <p className="text-gray-600 mb-6">{safeTranslate(t, `${plan.toLowerCase()}_plan_description`)}</p>

                            <ul className="text-gray-700 text-left mx-auto w-fit mb-6">
                                <li className="mb-2 flex items-center">
                                    <HiUserGroup className="text-indigo-500 mr-2 w-5 h-5" /> 
                                    {safeTranslate(t, `${plan.toLowerCase()}_plan_guest`)}
                                </li>
                                <li className="mb-2 flex items-center">
                                    <HiTicket className="text-indigo-500 mr-2 w-5 h-5" />
                                    {safeTranslate(t, `${plan.toLowerCase()}_plan_custom_ticketing`)}
                                </li>
                                <li className="mb-2 flex items-center">
                                    <HiBanknotes className="text-indigo-500 mr-2 w-5 h-5" />
                                    {safeTranslate(t, `${plan.toLowerCase()}_plan_commission`)}
                                </li>
                                <li className="mb-2 flex items-center">
                                    <HiChartBar className="text-indigo-500 mr-2 w-5 h-5" />
                                    {safeTranslate(t, `${plan.toLowerCase()}_plan_statistics`)}
                                </li>
                                <li className="mb-2 flex items-center">
                                    <HiChatBubbleLeftRight className="text-indigo-500 mr-2 w-5 h-5" />
                                    {safeTranslate(t, `${plan.toLowerCase()}_plan_advantage`)}
                                </li>
                            </ul>

                            {(() => {
                                const isSubscribed = activePlan !== "STARTER"; // user a payé
                                const isOtherPlan = planType !== activePlan;

                                const shouldDisable = isSubscribed && isOtherPlan;

                                const baseClasses = "py-2 px-6 rounded-full text-lg font-semibold transition-all";

                                // Si plan actif → bouton violet "Actif"
                                if (planType === activePlan) {
                                    return (
                                    <span className={`${baseClasses} bg-indigo-500 text-white`}>
                                        {safeTranslate(t, "active_plan")}
                                    </span>
                                    );
                                }

                                // Si plan inactif mais désactivé (autre que plan actif)
                                if (shouldDisable) {
                                    return (
                                    <button
                                        disabled
                                        className={`${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`}
                                    >
                                        {safeTranslate(t, "choose_plan_button")}
                                    </button>
                                    );
                                }

                                // Cas normal : plan sélectionnable (ex : user est STARTER)
                                return (
                                    <button
                                    onClick={() => handleSubscribe(priceIds[planType]!)}
                                    className={`${baseClasses} bg-indigo-500 text-white hover:bg-indigo-600`}
                                    >
                                    {safeTranslate(t, "choose_plan_button")}
                                    </button>
                                );
                                })()}
                        </div>
                    );
                })}
            </div>

        {/* Message de réassurance */}
        <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">{safeTranslate(t, "no_commitment_message")}</p>
        </div>
    </div>
    );
};

export default PricingTable;
