@@ .. @@
 export interface Plot {
   id: string;
   name: string;
   description?: string;
+  category_id?: string;
   created_at: string;
   updated_at: string;
+  category?: PlotCategory;
+}
+
+export interface PlotCategory {
+  id: string;
+  name: string;
+  description?: string;
+  color: string;
+  created_at: string;
 }
 
 export interface Row {
   id: string;
+  plot_id?: string;
   name: string;
   variety?: string;
   planted_date?: string;
   expected_harvest?: string;
   notes?: string;
   created_at: string;
   updated_at: string;
+  plot?: Plot;
 }