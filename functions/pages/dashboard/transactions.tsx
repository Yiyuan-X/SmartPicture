import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) router.push("/login");
    else {
      const ref = collection(db, `users/${u.uid}/transactions`);
      onSnapshot(ref, (snap) =>
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">积分明细</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th>类型</th>
            <th>数量</th>
            <th>说明</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b">
              <td>{t.type}</td>
              <td>{t.amount}</td>
              <td>{t.remark}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
