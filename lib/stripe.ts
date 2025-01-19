type PlanType = "STARTER" | "PREMIUM" | "PRO";

export const fetchStripeSubscriptionStatus = async (customerId: string): Promise<PlanType | null> => {
    try {
        const response = await fetch(`/api/check-subscription-status?customerId=${customerId}`);
        const data = await response.json();
        return data.activePlan as PlanType;
    } catch (error) {
        console.error("Error while checking subscription:", error);
        return null;
    }
};
