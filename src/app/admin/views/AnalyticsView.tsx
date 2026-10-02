"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Download,
  Calendar
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from "recharts";
import { motion } from "framer-motion";

export default function AnalyticsView() {
  // KPI stats for Analytics
  const stats = [
    { label: "Avg. Session Duration", value: "38.5 mins", change: "+4.2%", icon: Clock, color: "text-violet-500" },
    { label: "Completion Rate", value: "72.4%", change: "+2.8%", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Weekly Active Users", value: "84.3%", change: "+1.5%", icon: Users, color: "text-blue-500" },
    { label: "Retention Rate", value: "91.2%", change: "+0.8%", icon: TrendingUp, color: "text-amber-500" }
  ];

  // 1. Chart: User Signups (last 12 months)
  const growthData = [
    { name: "Jul", Signups: 120, Active: 90 },
    { name: "Aug", Signups: 150, Active: 110 },
    { name: "Sep", Signups: 210, Active: 160 },
    { name: "Oct", Signups: 290, Active: 230 },
    { name: "Nov", Signups: 350, Active: 280 },
    { name: "Dec", Signups: 420, Active: 350 },
    { name: "Jan", Signups: 490, Active: 410 },
    { name: "Feb", Signups: 580, Active: 490 },
    { name: "Mar", Signups: 690, Active: 580 },
    { name: "Apr", Signups: 820, Active: 700 },
    { name: "May", Signups: 980, Active: 840 },
    { name: "Jun", Signups: 1200, Active: 1050 }
  ];

  // 2. Chart: Most Popular Modules (Active Users)
  const popularityData = [
    { name: "Aptitude Tests", Users: 840 },
    { name: "Coding Problems", Users: 950 },
    { name: "Interview Coach", Users: 680 },
    { name: "Resume Builder", Users: 520 },
    { name: "Speakwise AI", Users: 410 },
    { name: "Mock Placement", Users: 790 }
  ];

  // 3. Chart: Completion Rates
  const completionData = [
    { name: "Aptitude", Rate: 78 },
    { name: "Coding", Rate: 62 },
    { name: "Interview Qs", Rate: 85 },
    { name: "Resume", Rate: 95 },
    { name: "Speakwise", Rate: 58 },
    { name: "Mock Test", Rate: 70 }
  ];

  // 4. Chart: Engagement Metrics (Hourly Activity)
  const engagementData = [
    { name: "Mon", Morning: 250, Afternoon: 320, Evening: 480 },
    { name: "Tue", Morning: 280, Afternoon: 340, Evening: 510 },
    { name: "Wed", Morning: 310, Afternoon: 380, Evening: 550 },
    { name: "Thu", Morning: 290, Afternoon: 360, Evening: 520 },
    { name: "Fri", Morning: 260, Afternoon: 310, Evening: 460 },
    { name: "Sat", Morning: 120, Afternoon: 180, Evening: 240 },
    { name: "Sun", Morning: 140, Afternoon: 190, Evening: 270 }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">System Performance</p>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs">
            <Calendar className="h-4 w-4" /> Last 30 Days
          </Button>
          <Button variant="secondary" size="sm" className="h-10 px-4 gap-1.5 text-xs">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{stat.value}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stat.change}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-violet-500" /> User Acquisition & Growth
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Tracking total signups and active preparation participants</p>
          </div>
          
          <div className="h-64 flex-1 text-[9px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                <Legend />
                <Area type="monotone" dataKey="Signups" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#signupGrad)" />
                <Area type="monotone" dataKey="Active" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#activeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Most Popular Modules */}
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-blue-500" /> Most Popular Modules
            </h3>
            <p className="text-xs text-zinc-505 mt-0.5">Active users taking preparation modules in the current month</p>
          </div>
          
          <div className="h-64 flex-1 text-[9px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData}>
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
                <Bar dataKey="Users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Module Completion Rates */}
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Average Module Completion Rates
            </h3>
            <p className="text-xs text-zinc-505 mt-0.5">Average task and test completion percentages by users</p>
          </div>
          
          <div className="h-64 flex-1 text-[9px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-900" />
                <XAxis type="number" tick={{ fill: "#71717a", fontSize: 9 }} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#71717a", fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(9, 9, 11, 0.9)", 
                    borderColor: "#27272a",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "11px"
                  }} 
                />
                <Bar dataKey="Rate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-amber-500" /> Daily User Engagement
            </h3>
            <p className="text-xs text-zinc-505 mt-0.5">Weekly student logins split by morning, afternoon, and evening</p>
          </div>
          
          <div className="h-64 flex-1 text-[9px] font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
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
                <Legend />
                <Line type="monotone" dataKey="Morning" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Afternoon" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Evening" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
