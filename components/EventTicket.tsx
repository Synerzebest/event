import { Progress } from 'antd'; 
import { motion } from "framer-motion";

interface Ticket {
  name: string;
  quantity: number;
  sold: number;
}

interface EventTicketProps {
  ticketsSummary: Ticket[];
}

const EventTicket: React.FC<EventTicketProps> = ({ ticketsSummary }) => {
  return (
    <motion.div
      className="py-6 border-b"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <h3 className="font-bold text-xl text-gray-800 mb-4">Tickets</h3>

      {ticketsSummary.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ticketsSummary.map((ticket, index) => {
            const total = ticket.quantity + ticket.sold;
            const soldPercentage = total > 0 ? (ticket.sold / total) * 100 : 0;

            return (
              <motion.div
                key={index}
                className="p-4 bg-white rounded-2xl shadow-md border hover:shadow-lg transition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{ticket.name}</h4>
                  <span className="text-sm text-gray-500">{ticket.quantity} left</span>
                </div>
                <Progress
                  percent={Math.round(soldPercentage)}
                  size="small"
                  strokeColor="#3b82f6"
                  showInfo={false}
                />
                <div className="text-sm text-gray-500 mt-1">{ticket.sold} sold</div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600">No tickets available</p>
      )}
    </motion.div>
  );
};

export default EventTicket;
