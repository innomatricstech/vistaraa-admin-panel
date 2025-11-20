import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Bell, Users, TrendingUp, Settings } from "lucide-react";

const data = [
  { name: "Mon", value: 30 },
  { name: "Tue", value: 45 },
  { name: "Wed", value: 60 },
  { name: "Thu", value: 50 },
  { name: "Fri", value: 70 },
  { name: "Sat", value: 40 },
  { name: "Sun", value: 55 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border rounded-xl shadow hover:bg-gray-100 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Alerts
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-xl shadow hover:bg-gray-800 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Users */}
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Users className="w-12 h-12 text-gray-700" />
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold">1,240</p>
            </div>
          </div>
        </motion.div>

        {/* Growth */}
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-12 h-12 text-green-600" />
            <div>
              <p className="text-gray-600 text-sm">Growth</p>
              <p className="text-3xl font-bold">+14%</p>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.03 }} className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Bell className="w-12 h-12 text-blue-600" />
            <div>
              <p className="text-gray-600 text-sm">Notifications</p>
              <p className="text-3xl font-bold">32</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}