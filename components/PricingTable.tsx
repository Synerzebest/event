import React, { useEffect, useState } from "react";
import { useTranslation } from "../app/i18n";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { fetchStripeSubscriptionStatus } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import { safeTranslate } from "@/lib/utils";

type PlanType = "STARTER" | "PREMIUM" | "PRO";

const priceIds: Record<PlanType, string | undefined> = {
    STARTER: process.env.NEXT_PUBLIC_PRICE_ID_STARTER,
    PREMIUM: process.env.NEXT_PUBLIC_PRICE_ID_PREMIUM,
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
        <div className="bg-gray-50 py-20 relative top-64">
            <h2 className="text-center text-4xl font-bold mb-12">{safeTranslate(t,'choose_plan')}</h2>

            {activePlan !== "STARTER" && (
                <div className="w-11/12 mx-auto flex justify-center mb-12">
                    <Alert showIcon message={safeTranslate(t,'active_subscription_message')} />
                </div>
            )}

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {["Starter", "Premium", "Pro"].map((plan) => {
                    const planType = plan.toUpperCase() as PlanType;
                    const isActive = planType === activePlan;

                    return (
                        <div
                            key={planType}
                            className={`relative w-[95%] lg:w-1/4 bg-gray-50 rounded-2xl shadow-lg p-8 text-center border border-gray-300
                                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                                    plan === "Premium" ? "border-2 border-blue-500" : ""
                                }`}
                        >
                            {/* Badge pour le plan populaire */}
                            {plan === "Premium" && (
                                <span className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                    {safeTranslate(t,'famous')}
                                </span>
                            )}

                            {/* Titre du plan */}
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{plan}</h3>

                            {/* Prix */}
                            <p className="text-5xl font-bold text-gray-900 mb-4">
                                {plan === "Starter" ? "0€" : plan === "Premium" ? "19.99€" : "49.99€"}
                                <span className="text-lg text-gray-500">/mo</span>
                            </p>

                            {/* Description */}
                            <p className="text-gray-600 mb-6">{safeTranslate(t,`${plan.toLowerCase()}_plan_description`)}</p>

                            {/* Avantages */}
                            <ul className="text-gray-700 text-left mx-auto w-fit mb-6">
                                <li className="mb-2 flex items-center">
                                    ✅ {safeTranslate(t,`${plan.toLowerCase()}_plan_advantage`)}
                                </li>
                                <li className="mb-2 flex items-center">
                                    ✅ {safeTranslate(t,`${plan.toLowerCase()}_plan_commission`)}
                                </li>
                            </ul>

                            {/* Bouton d'abonnement */}
                            {planType === "STARTER" ? (
                                <span className="py-2 px-6 rounded-full text-lg font-semibold bg-gray-500 text-white">
                                    {safeTranslate(t,"default_plan")}
                                </span>
                            ) : isActive ? (
                                <span className="py-2 px-6 rounded-full text-lg font-semibold bg-green-500 text-white">
                                    {safeTranslate(t,"active_plan")}
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleSubscribe(priceIds[planType]!)}
                                    disabled={activePlan !== "STARTER" && !isActive} 
                                    className={`py-3 px-6 rounded-full text-lg font-semibold transition-all ${
                                        isActive
                                            ? "bg-green-500 text-white"
                                            : activePlan !== "STARTER" && !isActive
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                                >
                                    {isActive ? safeTranslate(t,"active_plan") : safeTranslate(t,"choose_plan_button")}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PricingTable;
