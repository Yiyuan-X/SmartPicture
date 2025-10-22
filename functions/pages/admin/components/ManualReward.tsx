import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';


export function ManualReward() {
const [uid, setUid] = useState('');
const [amount, setAmount] = useState(0);
const [loading, setLoading] = useState(false);
const [msg, setMsg] = useState('');


const handleReward = async () => {
setLoading(true);
try {
const rewardPoints = httpsCallable(functions, 'rewardPoints');
const res: any = await rewardPoints({ uid, amount });
setMsg(`✅ 已为用户 ${uid} 发放 ${amount} 积分。`);
} catch (e: any) {
setMsg(`❌ ${e.message}`);
} finally {
setLoading(false);
}
};


return (
<div className="bg-white rounded-2xl p-4 shadow">
<h2 className="text-xl font-semibold mb-2">手动发放积分</h2>
<div className="flex space-x-2">
<input type="text" placeholder="用户UID" value={uid} onChange={(e) => setUid(e.target.value)} className="border rounded p-2 w-64" />
<input type="number" placeholder="积分数量" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="border rounded p-2 w-24" />
<button onClick={handleReward} disabled={loading} className="bg-blue-600 text-white px-4 rounded">
{loading ? '处理中...' : '发放'}
</button>
</div>
{msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
</div>
);
}