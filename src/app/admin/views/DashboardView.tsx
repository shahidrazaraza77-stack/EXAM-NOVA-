"use client";

import React from "react";
import { useAdmin } from "@/context/AdminContext";
import { Card } from "@/components/ui/Card";
import { 
  Users, 
  Activity, 
  HelpCircle, 
  Building2, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";

export default function DashboardView() {
  const { users, aptitudeQs, codingQs, technicalQs, hrQs, companies, mockTests } = useAdmin();

  // Compute live statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const totalQuestions = aptitudeQs.length + codingQs.length + technicalQs.length + hrQs.length;
  const totalCompanies = companies.length;
  const totalTestsConducted = mockTests.length * 48 + 342; // Simulated proportional value
  const estimatedRevenue = `$${(totalUsers * 12.5 + mockTests.length * 85).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // KPI Card details
  const kpis = [
    {
      title: "Total Users",
      value: totalUsers,
      change: "+12.5%",
      isPositive: true,
      icon: Users,
      color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50"
    },
    {
      title: "Active Users",
      value: activeUsers,
      change: "+8.3%",
      isPositive: true,
      icon: Activity,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50"
    },
    {
      title: "Total Questions",
      value: totalQuestions,
      change: `+${aptitudeQs.length} new`,
      isPositive: true,
      icon: HelpCircle,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50"
    },
    {
      title: "Companies Listed",
      value: totalCompanies,
      change: "Stable",
      isPositive: true,
      icon: Building2,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50"
    },
    {
      title: "Tests Conducted",
      value: totalTestsConducted,
      change: "+24.8%",
      isPositive: true,
      icon: CheckSquare,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50"
    },
    {
      title: "Estimated Revenue",
      value: estimatedRevenue,
      change: "+15.2%",
      isPositive: true,
      icon: DollarSign,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50"
    }
  ];

  // 1. Chart Data: User Growth (last 6 months)
  const userGrowthData = [
    { name: "Jan", Users: Math.max(10, totalUsers - 25) },
    { name: "Feb", Users: Math.max(15, totalUsers - 18) },
    { name: "Mar", Users: Math.max(22, totalUsers - 12) },
    { name: "Apr", Users: Math.max(35, totalUsers - 6) },
    { name: "May", Users: Math.max(48, totalUsers - 2) },
    { name: "Jun", Users: totalUsers }
  ];

  // 2. Chart Data: Daily Activity (logins/actions per weekday)
  const activityData = [
    { name: "Mon", Active: Math.round(activeUsers * 0.7) },
    { name: "Tue", Active: Math.round(activeUsers * 0.82) },
    { name: "Wed", Active: Math.round(activeUsers * 0.95) },
    { name: "Thu", Active: Math.round(activeUsers * 0.88) },
    { name: "Fri", Active: Math.round(activeUsers * 0.75) },
    { name: "Sat", Active: Math.round(activeUsers * 0.45) },
    { name: "Sun", Active: Math.round(activeUsers * 0.38) }
  ];

  // 3. Chart Data: Question Distribution (Pie Chart)
  const questionTypeData = [
    { name: "Aptitude", value: aptitudeQs.length },
    { name: "Coding", value: codingQs.length },
    { name: "Technical", value: technicalQs.length },
    { name: "HR", value: hrQs.length }
  ];

  const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as any;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-100 dark:border-zinc-900">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Welcome back, Shahid Afridi!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            ExamNova is performing smoothly. Here is your overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-100/50 dark:bg-violet-950/30 px-3 py-1.5 rounded-xl border border-violet-200/30">
          <TrendingUp className="h-4 w-4" />
          <span>Platform Status: Healthy</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="p-6 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 hover:border-zinc-350 dark:hover:border-zinc-800 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {kpi.title}
                    </p>
                    <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2 tracking-tight">
                      {kpi.value}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl border ${kpi.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-xs">
                  <span className={`flex items-center gap-0.5 font-bold ${kpi.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                    {kpi.isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {kpi.change}
                  </span>
                  <span className="text-zinc-450 dark:text-zinc-500">from last month</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[380px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">User Growth</h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">Registration trends over the last 6 months</p>
              </div>
            </div>
            
            <div className="h-64 flex-1 text-[9px] font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                  <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(9, 9, 11, 0.9)", 
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "11px"
                    }} 
                  />
                  <Area type="monotone" dataKey="Users" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrowthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Question Breakdown Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[380px] flex flex-col">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Content Split</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">Questions categorized by exam types</p>
            </div>

            <div className="h-56 flex-1 text-[9px] font-semibold mt-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={questionTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {questionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(9, 9, 11, 0.9)", 
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "11px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalQuestions}</span>
                <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Questions</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {questionTypeData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/50">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{item.name}:</span>
                  <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Daily Active Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[350px] flex flex-col">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Daily Active Activity</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">Average active users performing preparation drills per day</p>
            </div>
            
            <div className="h-64 flex-1 text-[9px] font-semibold mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                  <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(9, 9, 11, 0.9)", 
                      borderColor: "#27272a",
                      color: "#fff",
                      borderRadius: "12px",
                      fontSize: "11px"
                    }} 
                  />
                  <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
