type PlanType = "STARTER" | "PREMIUM" | "PRO";

export const fetchStripeSubscriptionStatus = async (customerId: string): Promise<PlanType> => {
    try {
        const response = await fetch(`/api/check-subscription-status?customerId=${customerId}`);
        const data = await response.json();


        const priceIdToPlan: Record<string, PlanType> = {
            [process.env.NEXT_PUBLIC_PRICE_ID_STARTER!]: "STARTER",
            [process.env.NEXT_PUBLIC_PRICE_ID_PREMIUM!]: "PREMIUM",
            [process.env.NEXT_PUBLIC_PRICE_ID_PRO!]: "PRO",
        };

        // 🔹 Si aucun abonnement, on considère l'utilisateur comme STARTER
        return data.activePlan ? (priceIdToPlan[data.activePlan] || "STARTER") : "STARTER";

    } catch (error) {
        console.error("Erreur lors de la vérification de l'abonnement:", error);
        return "STARTER"; // 🔹 Sécurité : en cas d'erreur, on met aussi STARTER par défaut
    }
};