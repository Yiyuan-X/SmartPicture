import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import React, { useEffect, useState } from 'react';


export function UserTable() {
const [users, setUsers] = useState<any[]>([]);


useEffect(() => {
(async () => {
const snapshot = await getDocs(collection(db, 'users'));
setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
})();
}, []);


return (
<div className="bg-white rounded-2xl p-4 shadow">
<h2 className="text-xl font-semibold mb-2">用户积分总览</h2>
<table className="w-full text-sm">
<thead>
<tr className="border-b text-left">
<th>邮箱</th>
<th>等级</th>
<th>积分</th>
<th>注册时间</th>
</tr>
</thead>
<tbody>
{users.map((u) => (
<tr key={u.id} className="border-b">
<td>{u.email}</td>
<td>{u.level}</td>
<td>{u.points}</td>
<td>{new Date(u.createdAt).toLocaleDateString()}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}