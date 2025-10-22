import { onRequest } from "firebase-functions/v2/https"
// functions/analytics/exportReports.ts

import admin from "firebase-admin";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";

const db = admin.firestore();

export const exportReports = onRequest(async (req, res) => {
  const format = req.query.format || "csv"; // 支持 ?format=excel
  const snapshot = await db.collectionGroup("transactions").get();
  const data = snapshot.docs.map((d) => d.data());

  if (format === "csv") {
    const parser = new Parser({ fields: ["type", "amount", "remark", "createdAt"] });
    const csv = parser.parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.send(csv);
  } else {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Transactions");
    sheet.columns = [
      { header: "Type", key: "type" },
      { header: "Amount", key: "amount" },
      { header: "Remark", key: "remark" },
      { header: "Created At", key: "createdAt" },
    ];
    sheet.addRows(data);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  }
});
