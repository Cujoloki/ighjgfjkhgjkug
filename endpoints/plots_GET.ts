@@ .. @@
       .whereRef('plotRows.plotId', '=', 'plots.id')
     ),
-    '[]'::any // Kysely requires type casting for json empty array default
+    sql`'[]'::json` // Kysely requires type casting for json empty array default
   ).as('rows')
 ])