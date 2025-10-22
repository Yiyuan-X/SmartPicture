import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

import { onRequest } from "firebase-functions/v2/https"
// functions/analytics/bigqueryStats.ts

import { BigQuery } from "@google-cloud/bigquery";

const bq = new BigQuery();

export const bigqueryStats = onRequest(async (req, res) => {
  const query = `
    SELECT
      DATE(TIMESTAMP_MILLIS(createdAt)) AS date,
      SUM(CASE WHEN type='recharge' THEN amount ELSE 0 END) AS totalRecharge,
      SUM(CASE WHEN type='consume' THEN amount ELSE 0 END) AS totalConsume,
      COUNT(DISTINCT uid) AS activeUsers
    FROM \`your_project_id.firestore_export.transactions\`
    WHERE createdAt >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    GROUP BY date
    ORDER BY date ASC
  `;

  const [rows] = await bq.query({ query });
  res.json(rows);
});
