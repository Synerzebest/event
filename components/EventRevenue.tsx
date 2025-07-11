'use client';

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface Ticket {
  name: string;
  price: number;
  sold: number;
  revenue: number;
}

interface EventRevenueProps {
  ticketsSummary: Ticket[];
  totalRevenue: number;
}

const EventRevenue: React.FC<EventRevenueProps> = ({ ticketsSummary, totalRevenue }) => {
  const chartData = ticketsSummary.map(ticket => ({
    name: ticket.name,
    revenue: ticket.revenue,
  }));

  return (
    <motion.div
      className="py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <h3 className="font-bold text-xl text-gray-800 mb-2">Revenue</h3>
      <p className="text-xl font-bold text-green-600 mb-4">Total: {totalRevenue} €</p>

      {ticketsSummary.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Revenue by Ticket</h4>
          <div className="w-full h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => `${value} €`} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[0, 6, 6, 0]}>
                <LabelList
                    dataKey="revenue"
                    position="right"
                    formatter={(label) =>
                        typeof label === 'number' ? `${label} €` : label
                    }
                />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h4 className="font-semibold text-gray-700">Sales Details</h4>
          <ul className="space-y-2 mt-2">
            {ticketsSummary.map((ticket, index) => (
              <li key={index} className="flex justify-between text-gray-600 text-sm">
                <span>{ticket.name}</span>
                <span>{ticket.sold} × {ticket.price} € = <strong>{ticket.revenue} €</strong></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default EventRevenue;
