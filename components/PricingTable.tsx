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
        <div className="bg-gray-100 py-20 relative top-64">
            <h2 className="text-center text-4xl font-bold mb-12">{t('choose_plan')}</h2>

            {activePlan && (
                <div className="w-11/12 mx-auto flex justify-center mb-12">
                    <Alert showIcon type="info" message={t('active_subscription_message')} />
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
                            className={`w-[95%] md:w-1/4 bg-white rounded-lg shadow-lg p-8 text-center border ${
                                plan === "Premium"
                                    ? "border-2 border-blue-500"
                                    : "border-gray-200"
                            } hover:shadow-xl duration-200`}
                        >
                            <h3 className="text-2xl font-bold mb-4">{plan}</h3>
                            <p className="text-4xl font-bold mb-4">
                                {plan === "Starter" ? "0€" : plan === "Premium" ? "5€" : "10€"}
                                <span className="text-lg">/mo</span>
                            </p>
                            <p className="text-gray-500 mb-8">
                                {t(`${plan.toLowerCase()}_plan_description`)}
                            </p>
                            <ul className="text-gray-600 mb-8">
                                <li className="mb-2">{t(`${plan.toLowerCase()}_plan_advantage`)}</li>
                                <li className="mb-2">{t(`${plan.toLowerCase()}_plan_commission`)}</li>
                            </ul>
                            {planType === "STARTER" ? (
                                <span
                                    className={`py-2 px-4 rounded-full ${
                                        isDefault
                                            ? "bg-blue-500 text-white"
                                            : isActive
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-700"
                                    }`}
                                >
                                    {isDefault ? t('default_plan') : isActive ? t('active_plan') : t('default_plan')}
                                </span>
                            ) : activePlan ? (
                                <button
                                    className={`py-2 px-4 rounded-full ${
                                        isActive
                                            ? "bg-green-500 text-white"
                                            : "opacity-50 cursor-not-allowed bg-gray-300"
                                    }`}
                                    disabled={!isActive}
                                >
                                    {isActive ? t('active_plan') : t('disabled_plan')}
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        user
                                            ? router.push(`/${lng}/subscribe?priceId=${priceIds[planType]}`)
                                            : router.push("/auth/signin")
                                    }
                                    className={`py-2 px-4 rounded-full ${
                                        user ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500"
                                    }`}
                                >
                                    {user ? t('choose_plan_button') : t('signin_to_subscribe')}
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
