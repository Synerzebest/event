import { IoPersonAdd } from "react-icons/io5";
import { Event as EventType } from "@/types/types";
import { notification } from 'antd';


const InviteButton = ({ event }: { event: EventType }) => {
    const handleInvite = () => {
        const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/${event.id}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            // Utiliser la notification d'Ant Design
            notification.success({
                message: "Invitation link copied!",
                description: "You can now share this link with others.",
                placement: "topRight",
                duration: 3, // Durée de la notification en secondes
            });
        });
    };

    return (
        <div>
            {/* Votre code d'affichage d'événement ici */}
            <button onClick={handleInvite}>
                <IoPersonAdd /> Invite
            </button>
        </div>
    );
};

export default InviteButton;

