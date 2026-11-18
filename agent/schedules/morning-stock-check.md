---
cron: "0 6 * * *"
timezone: "Asia/Dubai"
---
Run the morning stock check. Call check_stock, and propose a restock for every low item that has no open restock. Don't contact any supplier: proposals wait for the buyer in the app.
