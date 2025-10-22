import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';


export function ReportCharts() {
const [data, setData] = useState<any[]>([]);


useEffect(() => {
(async () => {
const txs = await getDocs(collectionGroup(db, 'transactions'));
const grouped: Record<string, { recharge: number; consume: number }> = {};
txs.forEach((d) => {
const t = d.data();
const day = new Date(t.createdAt).toISOString().split('T')[0];
if (!grouped[day]) grouped[day] = { recharge: 0, consume: 0 };
if (t.type === 'recharge') grouped[day].recharge += t.amount;
if (t.type === 'consume') grouped[day].consume += Math.abs(t.amount);
});
setData(Object.entries(grouped).map(([date, v]) => ({ date, ...v })));
})();
}, []);


return (
<div className="bg-white rounded-2xl p-4 shadow">
<h2 className="text-xl font-semibold mb-2">充值 / 消耗趋势</h2>
<LineChart width={600} height={250} data={data}>
<Line type="monotone" dataKey="recharge" stroke="#4ade80" name="充值" />
<Line type="monotone" dataKey="consume" stroke="#f87171" name="消耗" />
<CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
<XAxis dataKey="date" />
<YAxis />
<Tooltip />
</LineChart>
</div>
);
}