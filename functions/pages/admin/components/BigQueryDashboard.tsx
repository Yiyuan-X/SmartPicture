import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function BigQueryDashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTION_URL}/bigqueryStats`);
      const json = await res.json();
      setData(json);
    })();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h2 className="text-xl font-semibold mb-2">💰 每日 GMV 与活跃趋势</h2>
      <LineChart width={700} height={300} data={data}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalRecharge" stroke="#4ade80" name="充值总额" />
        <Line type="monotone" dataKey="totalConsume" stroke="#f87171" name="消耗总额" />
        <Line type="monotone" dataKey="activeUsers" stroke="#60a5fa" name="活跃用户数" />
      </LineChart>
    </div>
  );
}
