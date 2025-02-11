import React, { useEffect, useState } from "react";
import { useTranslation } from "../app/i18n";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { fetchStripeSubscriptionStatus } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import { Alert } from "antd";

type PlanType = "STARTER" | "PREMIUM" | "PRO";

const priceIds: Record<PlanType, string | undefined> = {
    STARTER: process.env.NEXT_PUBLIC_PRICE_ID_STARTER,
    PREMIUM: process.env.NEXT_PUBLIC_PRICE_ID_PREMIUM,
    PRO: process.env.NEXT_PUBLIC_PRICE_ID_PRO,
};

const PricingTable = ({ lng }: { lng: "en" | "fr" | "nl" }) => {
    const { t } = useTranslation(lng, "common");
    const { user } = useFirebaseUser();
    const router = useRouter(); // Hook pour la navigation
    const [activePlan, setActivePlan] = useState<PlanType | null>(null);

    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            if (user?.stripeCustomerId) {
                const priceId = await fetchStripeSubscriptionStatus(user.stripeCustomerId);

                const planType = Object.keys(priceIds).find(
                    (key) => priceIds[key as PlanType] === priceId
                ) as PlanType | undefined;

                if (planType) {
                    setActivePlan(planType);
                } else {
                    console.error("Price ID does not match any plan type:", priceId);
                }
            }
        };
        checkSubscriptionStatus();
    }, [user]);

    return (
        <div className="bg-gray-700 py-20 relative top-64">
            <h2 className="text-center text-4xl font-bold mb-12 text-white">{t('choose_plan')}</h2>

            {activePlan && (
                <div className="w-11/12 mx-auto flex justify-center mb-12">
                    <Alert showIcon message={t('active_subscription_message')} />
                </div>
            )}

<div className="flex flex-col md:flex-row items-center justify-center gap-8">
    {["Starter", "Premium", "Pro"].map((plan) => {
        const planType = plan.toUpperCase() as PlanType;
        const isActive = planType === activePlan;
        const isDefault = planType === "STARTER" && !activePlan;

        return (
            <div
                key={planType}
                className={`relative w-[95%] md:w-1/4 bg-gray-50 rounded-2xl shadow-lg p-8 text-center border border-gray-300
                    transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                        plan === "Premium" ? "border-2 border-blue-500" : ""
                    }`}
            >
                {/* Badge pour le plan populaire */}
                {plan === "Premium" && (
                    <span className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t('famous')}
                    </span>
                )}

                {/* Titre du plan */}
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{plan}</h3>

                {/* Prix */}
                <p className="text-5xl font-bold text-gray-900 mb-4">
                    {plan === "Starter" ? "0€" : plan === "Premium" ? "5€" : "10€"}
                    <span className="text-lg text-gray-500">/mo</span>
                </p>

                {/* Description */}
                <p className="text-gray-600 mb-6">{t(`${plan.toLowerCase()}_plan_description`)}</p>

                {/* Avantages */}
                <ul className="text-gray-700 text-left mx-auto w-fit mb-6">
                    <li className="mb-2 flex items-center">
                        ✅ {t(`${plan.toLowerCase()}_plan_advantage`)}
                    </li>
                    <li className="mb-2 flex items-center">
                        ✅ {t(`${plan.toLowerCase()}_plan_commission`)}
                    </li>
                </ul>

                {/* Bouton ou étiquette d'état */}
                {planType === "STARTER" ? (
                    <span
                        className={`py-2 px-6 rounded-full text-lg font-semibold  ${
                            isDefault
                                ? "bg-blue-500 text-white"
                                : isActive
                                ? "bg-gray-500 text-white"
                                : "bg-gray-300 text-gray-700"
                        }`}
                    >
                        {isDefault ? t("default_plan") : isActive ? t("active_plan") : t("default_plan")}
                    </span>
                ) : activePlan ? (
                    <button
                        className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${
                            isActive
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                        }`}
                        disabled={!isActive}
                    >
                        {isActive ? t("active_plan") : t("disabled_plan")}
                    </button>
                ) : (
                    <button
                        onClick={() =>
                            user
                                ? router.push(`/${lng}/subscribe?priceId=${priceIds[planType]}`)
                                : router.push("/auth/signin")
                        }
                        className={`py-3 px-6 rounded-full text-lg font-semibold transition-all ${
                            user
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        {user ? t("choose_plan_button") : t("signin_to_subscribe")}
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
