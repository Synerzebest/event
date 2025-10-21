"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar, Footer, EventComponent } from "@/components";
import { Spin, Button, message, Form, Input, Tag, Alert } from "antd"; // ← Radio supprimé
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Ticket } from "@/types/types";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import useLanguage from "@/lib/useLanguage";
import { safeTranslate } from "@/lib/utils";
import { useTranslation } from "@/app/i18n";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

type Event = {
  title: string;
  date: string;
  place: string;
  images: string[];
  tickets: Ticket[];
};

const ticketVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.01 },
  tap: { scale: 0.995 },
};

const Page = () => {
  const { eventId } = useParams() as { eventId: string };
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedTicketPrice, setSelectedTicketPrice] = useState<number | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { user } = useFirebaseUser();
  const userId = user?.uid || "";
  const userEmail = user?.email || "";

  const [guestEmail, setGuestEmail] = useState("");


  const router = useRouter();
  const [processing, setProcessing] = useState<boolean>(false);

  const lng = useLanguage();
  const { t } = useTranslation(lng, "common");

  // Préremplir prénom/nom depuis displayName
  useEffect(() => {
    if (user?.displayName && !firstName && !lastName) {
      const parts = user.displayName.trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [user?.displayName, firstName, lastName]);

  // Fetch Event
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const response = await fetch(`/api/getEventById/${eventId}`);
        const data = await response.json();
        if (response.ok) {
          setEvent(data);
        } else {
          console.error("Event not found or error:", data.error);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleTicketChange = useCallback((value: string) => {
    setSelectedTicket(value);
    const sel = event?.tickets.find((t) => t.name === value);
    setSelectedTicketPrice(sel ? sel.price : null);
  }, [event?.tickets]);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      if (!selectedTicket) {
        message.error(safeTranslate(t, "select_ticket_first") || "Sélectionnez un ticket.");
        return;
      }
      if (!event?.tickets) {
        message.error("Les données de l’événement ne sont pas disponibles.");
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        message.error(safeTranslate(t, "name_required"));
        return;
      }

      const selectedTicketData = event.tickets.find((ticket) => ticket.name === selectedTicket);
      if (!selectedTicketData) {
        message.error("Le ticket sélectionné est introuvable.");
        return;
      }

      const finalEmail = user ? userEmail : guestEmail;

      // Tickets gratuits
      if (selectedTicketData.price === 0) {
        try {
          const response = await fetch("/api/tickets/free", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              ticketName: selectedTicketData.name,
              userId,
              firstName,
              lastName,
              userEmail: finalEmail,
            }),
          });

          if (response.ok) {
            message.success("Inscription confirmée");
            router.push(`/success/${eventId}`);
          } else {
            const error = await response.json();
            message.error(`Erreur : ${error.message || "Impossible de compléter la demande."}`);
          }
        } catch (error) {
          console.error("Erreur tickets gratuits:", error);
          message.error("Une erreur s'est produite lors de la réservation du ticket.");
        }
        return;
      }

      // Tickets payants
      const stripe = await stripePromise;
      if (!stripe) {
        message.error("Erreur Stripe (init).");
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: {
            name: selectedTicketData.name,
            price: selectedTicketData.price,
            quantity: selectedTicketData.quantity, // stock vérifié côté backend
          },
          userId,
          eventId,
          firstName,
          lastName,
          userEmail: finalEmail
        }),
      });

      const session = await response.json();
      if (!response.ok) {
        console.error(session.error);
        message.error("Erreur lors de la création de la session de paiement.");
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        console.error(result.error.message);
        message.error("Erreur pendant la redirection vers le paiement.");
      }
    } catch (err) {
      console.error(err);
      message.error("Une erreur s'est produite.");
    } finally {
      // Si pas de redirection (erreur), on réactive le bouton
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar lng={lng} />
        <div className="w-full flex justify-center relative top-24">
          <Spin size="large" />
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar lng={lng} />
        <div className="w-full flex justify-center relative top-24">
          <p>Nothing to see here</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar lng={lng} />
      <motion.div
        className="relative top-16 sm:top-36 flex flex-col flex-col-reverse md:flex-row items-start w-11/12 mx-auto gap-8 pt-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Panneau Achat */}
        <motion.div
          className="w-full md:w-2/3 flex flex-col border border-gray-200 rounded-2xl bg-white p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-gray-900">
            {safeTranslate(t, "buy_ticket")}
          </h3>

          {!event?.tickets?.length && (
            <Alert
              type="info"
              showIcon
              message={safeTranslate(t, "no_tickets") || "Aucun ticket disponible pour le moment."}
              className="mb-4"
            />
          )}

          {/* Tickets – cartes custom (sans AntD Radio) */}
          <div className="mb-6">
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
              {safeTranslate(t, "choose_ticket")}
            </label>

            <div className="flex flex-col gap-3">
              {event.tickets.map((ticket) => {
                const soldOut = ticket.quantity <= 0;
                const selected = selectedTicket === ticket.name;

                return (
                  <motion.button
                    key={ticket.name}
                    type="button"
                    variants={ticketVariants}
                    initial="initial"
                    animate="animate"
                    whileHover={!soldOut ? "hover" : undefined}
                    whileTap={!soldOut ? "tap" : undefined}
                    transition={{ duration: 0.15 }}
                    onClick={() => !soldOut && handleTicketChange(ticket.name)}
                    onKeyDown={(e) => {
                      if (soldOut) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTicketChange(ticket.name);
                      }
                      // navigation clavier ↑ ↓
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const dir = e.key === "ArrowDown" ? 1 : -1;
                        const enabled = event.tickets.filter(t => t.quantity > 0);
                        const pos = enabled.findIndex(t => t.name === (selectedTicket ?? ""));
                        const next = enabled[(pos + dir + enabled.length) % enabled.length];
                        if (next) handleTicketChange(next.name);
                      }
                    }}
                    disabled={soldOut}
                    aria-pressed={selected}
                    aria-label={`${ticket.name} ${soldOut ? safeTranslate(t,"sold_out") : ""}`}
                    className={[
                      "w-full text-left rounded-xl border px-4 py-3 md:px-5 md:py-4 transition focus:outline-none",
                      selected
                        ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300 bg-white",
                      soldOut ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                      "focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex items-center gap-3">
                        <p className="text-sm md:text-base font-semibold text-gray-900 truncate">
                          {ticket.name}
                        </p>
                        {ticket.price === 0 ? (
                          <Tag color="green" className="text-sm md:text-base m-0 px-2 py-1 rounded-full">
                            {safeTranslate(t, "free") || "Gratuit"}
                          </Tag>
                        ) : (
                          <span className="text-sm md:text-base font-semibold text-gray-900">
                            {ticket.price.toFixed(2)} €
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                      <p className="text-xs md:text-sm text-gray-500">
                          {soldOut ? (
                            <span className="text-red-600 font-medium">
                              {safeTranslate(t, "sold_out")}
                            </span>
                          ) : (
                            <>
                              {ticket.quantity} {safeTranslate(t, "available")}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Formulaire dynamique selon la connexion */}
          <Form layout="vertical" onFinish={handleCheckout} requiredMark={false} className="mb-2">

          {/* Section invitée si pas de user */}
          {!user && (
            <>
              <Alert
                type="info"
                showIcon
                message="Vous participez en tant qu'invité. Un ticket vous sera envoyé par email."
                className="mb-4"
              />

              <Form.Item
                label="Adresse email"
                required
                rules={[
                  { required: true, message: "Email requis" },
                  { type: "email", message: "Adresse email invalide" }
                ]}
              >
                <Input
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  size="large"
                  className="rounded-md"
                  placeholder="exemple@email.com"
                />
              </Form.Item>
            </>
          )}

          {/* Champs prénom / nom (communs) */}
          <div className="flex flex-col">
            <Form.Item
              label={safeTranslate(t, "last_name")}
              required
              rules={[{ required: true, message: safeTranslate(t, "name_required") }]}
            >
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                size="large"
                className="rounded-md"
                placeholder={safeTranslate(t, "last_name")}
              />
            </Form.Item>

            <Form.Item
              label={safeTranslate(t, "first_name")}
              required
              rules={[{ required: true, message: safeTranslate(t, "name_required") }]}
            >
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                size="large"
                className="rounded-md"
                placeholder={safeTranslate(t, "first_name")}
              />
            </Form.Item>
          </div>

          {/* Résumé + bouton */}
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm md:text-base text-gray-700">
                {selectedTicket
                  ? `${safeTranslate(t, "selected")} : ${selectedTicket}`
                  : safeTranslate(t, "choose_ticket")}
              </span>
              <span className="text-sm md:text-base font-semibold text-gray-900">
                {selectedTicketPrice !== null ? `${selectedTicketPrice.toFixed(2)} €` : "—"}
              </span>
            </div>

            <Button
              htmlType="submit"
              type="default"
              className="w-full py-3 md:py-4 mt-1 bg-indigo-600 border border-indigo-600 hover:!bg-indigo-700 hover:!text-white hover:!border-indigo-700 text-white font-semibold transition-all rounded-lg duration-300"
              size="large"
              onClick={(e) => {
                if (!selectedTicket) {
                  e.preventDefault();
                  message.error(safeTranslate(t, "select_ticket_first") || "Sélectionnez un ticket.");
                }
              }}
              disabled={!selectedTicket || processing}
            >
              {processing ? (
                <Spin size="small" />
              ) : (
                <>
                  {safeTranslate(t, "confirm_registration")}
                  {selectedTicketPrice !== null && !processing && (
                    ` (${selectedTicketPrice === 0
                      ? safeTranslate(t, "free") || "Gratuit"
                      : `${selectedTicketPrice.toFixed(2)} €`})`
                  )}
                </>
              )}
            </Button>
          </div>
          </Form>
        </motion.div>

        {/* Panneau de droite : détails de l’événement */}
        <div className="w-full sm:w-fit flex justify-center">
            <EventComponent eventId={eventId} participateButton={false} />
        </div>
        
      </motion.div>
      <Footer />
    </>
  );
};

export default Page;
