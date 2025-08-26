@@ .. @@
 import React, { useState } from 'react';
+import { PlotSelector } from './PlotSelector';
 import type { Row } from '../types/database';
 
@@ .. @@
   const [formData, setFormData] = useState({
   }
   )
+    plot_id: row?.plot_id || '',
     name: row?.name || '',
@@ .. @@
           />
         </div>
         
+        <div>
+          <label className="block text-sm font-medium text-gray-700 mb-1">
+            Plot
+          </label>
+          <PlotSelector
+            selectedPlotId={formData.plot_id}
+            onPlotSelect={(plotId) => setFormData({ ...formData, plot_id: plotId || '' })}
+          />
+        </div>
+        
         <div>