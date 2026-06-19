import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle, Activity, Sparkles, UserMinus, IndianRupee } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { motion } from "framer-motion";

const revenueForecastData = [
  { month: 'Jul', actual: 5.8, forecast: 5.8 },
  { month: 'Aug', actual: null, forecast: 6.2 },
  { month: 'Sep', actual: null, forecast: 6.5 },
  { month: 'Oct', actual: null, forecast: 6.9 },
  { month: 'Nov', actual: null, forecast: 7.1 },
  { month: 'Dec', actual: null, forecast: 7.4 },
];

const churnRiskData = [
  { name: "Suresh Menon", room: "102-A", probability: "85%", reason: "Frequent Maintenance Issues", trend: "Increasing" },
  { name: "Priya Singh", room: "305-B", probability: "72%", reason: "Rent Overdue > 15 Days", trend: "Stable" },
  { name: "Arjun Reddy", room: "201-C", probability: "60%", reason: "End of lease approaching", trend: "Decreasing" },
];

export function Forecasting() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Forecasting & AI Insights</h1>
          <p className="text-gray-500">Predictive analytics powered by Phrydl Intelligence.</p>
        </div>
      </div>

      {/* AI Summary Card */}
      <Card className={cn("border-gray-200 bg-accent/5", glassClasses.panel)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex flex-shrink-0 items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Executive Forecast Summary</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                "Q3 revenue is projected to grow by 12% reaching ₹7.4L by December. 
                However, I've detected a high churn risk in the HSR Layout property due to recurring maintenance delays. 
                Addressing the 4 open plumbing tickets could save approximately ₹45,000 in monthly recurring revenue."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Projected Q3 Revenue</p>
            <h3 className="text-3xl font-black text-gray-900 mb-2">₹20.6L</h3>
            <p className="text-xs font-semibold text-green-600">+12% vs Q2 Actual</p>
          </CardContent>
        </Card>
        
        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Predicted Churn Rate</p>
            <h3 className="text-3xl font-black text-gray-900 mb-2">4.2%</h3>
            <p className="text-xs font-semibold text-red-500">+1.1% vs Last Month</p>
          </CardContent>
        </Card>

        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Property Health Score</p>
            <h3 className="text-3xl font-black text-gray-900 mb-2">94/100</h3>
            <p className="text-xs font-semibold text-gray-500">Stable</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Forecast Chart */}
        <Card className={cn("border-gray-200 bg-white", glassClasses.card)}>
          <CardHeader>
            <CardTitle className="text-gray-900">Revenue Forecast (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC83D" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFC83D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#111111', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#111" strokeWidth={4} fillOpacity={0} />
                  <Area type="monotone" dataKey="forecast" stroke="#FFC83D" strokeWidth={4} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black rounded-sm"></div> Actual</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-accent rounded-sm"></div> Forecast</div>
            </div>
          </CardContent>
        </Card>

        {/* Churn Risk List */}
        <Card className={cn("border-gray-200 bg-white flex flex-col", glassClasses.card)}>
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> High Churn Risk Tenants
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {churnRiskData.map((tenant, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-900">{tenant.name}</h4>
                    <p className="text-xs text-gray-500">{tenant.room} • {tenant.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-red-600 text-lg">{tenant.probability}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Probability</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
