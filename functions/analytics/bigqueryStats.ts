import { onRequest } from "firebase-functions/v2/https";
import { JobServiceClient, protos } from "@google-cloud/bigquery";

const jobServiceClient = new JobServiceClient();

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

  const projectId =
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.GCP_PROJECT ??
    process.env.PROJECT_ID;

  if (!projectId) {
    res.status(500).json({ error: "Missing Google Cloud project id" });
    return;
  }

  try {
    const [queryResponse] = await jobServiceClient.query({
      projectId,
      queryRequest: {
        query,
        useLegacySql: {
          value: false,
        },
      },
    });

    const structRows = queryResponse.rows ?? [];
    const rows = structRows.map((struct) => structToPlainObject(struct));

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to run BigQuery stats query",
    });
  }
});

function structToPlainObject(struct: protos.google.protobuf.IStruct) {
  const result: Record<string, unknown> = {};
  const fields = struct.fields ?? {};

  for (const [key, value] of Object.entries(fields)) {
    if (!value) {
      result[key] = null;
      continue;
    }

    if (value.stringValue !== undefined) {
      result[key] = value.stringValue;
      continue;
    }

    if (value.numberValue !== undefined) {
      result[key] = value.numberValue;
      continue;
    }

    if (value.boolValue !== undefined) {
      result[key] = value.boolValue;
      continue;
    }

    if (value.nullValue !== undefined) {
      result[key] = null;
      continue;
    }

    if (value.structValue) {
      result[key] = structToPlainObject(value.structValue);
      continue;
    }

    if (value.listValue) {
      const list = value.listValue.values ?? [];
      result[key] = list.map((item) => structToPlainObject({ fields: { value: item } }).value);
      continue;
    }

    result[key] = value;
  }

  return result;
}
