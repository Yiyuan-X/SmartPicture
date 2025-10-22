import React from "react";
export function PointsCard({ points }: { points: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow text-center">
      <h2 className="text-xl font-semibold mb-2">当前积分</h2>
      <p className="text-4xl font-bold text-blue-600">{points}</p>
    </div>
  );
}
