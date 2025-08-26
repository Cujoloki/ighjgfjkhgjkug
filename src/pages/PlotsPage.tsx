@@ .. @@
 import React, { useState, useEffect } from 'react';
-import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
+import { Plus, Edit2, Trash2, MapPin, Filter } from 'lucide-react';
+import { PlotCategoryManager } from '../components/PlotCategoryManager';
+import { plotService } from '../services/plotService';
+import type { Plot, PlotCategory } from '../types/database';
-import { supabase } from '../lib/supabase';
-import type { Plot } from '../types/database';
 
 export function PlotsPage() {
   const [plots, setPlots] = useState<Plot[]>([]);
+  const [selectedCategory, setSelectedCategory] = useState<PlotCategory | null>(null);
+  const [showCategoryManager, setShowCategoryManager] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
@@ .. @@
   const [formData, setFormData] = useState({
     name: '',
-    description: ''
+    description: '',
+    category_id: ''
   });
 
@@ .. @@
   const loadPlots = async () => {
     try {
-      const { data, error } = await supabase
-        .from('plots')
-        .select('*')
-        .order('name', { ascending: true });
-
-      if (error) throw error;
-      setPlots(data || []);
+      const data = selectedCategory 
+        ? await plotService.getPlotsByCategory(selectedCategory.id)
+        : await plotService.getPlots();
+      setPlots(data);
     } catch (error) {
@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
+      const plotData = {
+        ...formData,
+        category_id: formData.category_id || null
+      };
+      
       if (editingPlot) {
-        const { error } = await supabase
-          .from('plots')
-          .update(formData)
-          .eq('id', editingPlot.id);
-        
-        if (error) throw error;
+        await plotService.updatePlot(editingPlot.id, plotData);
       } else {
-        const { error } = await supabase
-          .from('plots')
-          .insert(formData);
-        
-        if (error) throw error;
+        await plotService.createPlot(plotData);
       }
       
@@ .. @@
   const handleEdit = (plot: Plot) => {
     setEditingPlot(plot);
     setFormData({
       name: plot.name,
-      description: plot.description || ''
+      description: plot.description || '',
+      category_id: plot.category_id || ''
     });
@@ .. @@
   const handleDelete = async (id: string) => {
     if (confirm('Are you sure you want to delete this plot?')) {
       try {
-        const { error } = await supabase
-          .from('plots')
-          .delete()
-          .eq('id', id);
-        
-        if (error) throw error;
+        await plotService.deletePlot(id);
         await loadPlots();
@@ .. @@
   const resetForm = () => {
     setFormData({ 
       name: '', 
-      description: '' 
+      description: '',
+      category_id: ''
     });
@@ .. @@
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
-        <h1 className="text-2xl font-bold text-gray-900">Plots</h1>
-        <button
-          onClick={() => setShowForm(true)}
-          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
-        >
-          <Plus className="w-4 h-4" />
-          Add Plot
-        </button>
+        <div>
+          <h1 className="text-2xl font-bold text-gray-900">Plots</h1>
+          {selectedCategory && (
+            <p className="text-sm text-gray-600 mt-1">
+              Showing plots in category: <span className="font-medium">{selectedCategory.name}</span>
+            </p>
+          )}
+        </div>
+        <div className="flex gap-2">
+          <button
+            onClick={() => setShowCategoryManager(!showCategoryManager)}
+            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
+          >
+            <Filter className="w-4 h-4" />
+            Categories
+          </button>
+          <button
+            onClick={() => setShowForm(true)}
+            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
+          >
+            <Plus className="w-4 h-4" />
+            Add Plot
+          </button>
+        </div>
       </div>
 
+      {/* Category Manager */}
+      {showCategoryManager && (
+        <div className="bg-gray-50 p-4 rounded-lg">
+          <PlotCategoryManager 
+            onCategorySelect={setSelectedCategory}
+            selectedCategoryId={selectedCategory?.id}
+          />
+        </div>
+      )}
+
       {isLoading ? (
@@ .. @@
               <div key={plot.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <div className="flex items-start justify-between">
                   <div className="flex-1">
-                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plot.name}</h3>
+                    <div className="flex items-center gap-2 mb-2">
+                      <h3 className="text-lg font-semibold text-gray-900">{plot.name}</h3>
+                      {plot.category && (
+                        <span
+                          className="px-2 py-1 text-xs rounded-full text-white"
+                          style={{ backgroundColor: plot.category.color }}
+                        >
+                          {plot.category.name}
+                        </span>
+                      )}
+                    </div>
                     {plot.description && (
@@ .. @@
                     <textarea
                       value={formData.description}
                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       rows={3}
                     />
                   </div>
+                  
+                  <div>
+                    <label className="block text-sm font-medium text-gray-700 mb-1">
+                      Category
+                    </label>
+                    <select
+                      value={formData.category_id}
+                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
+                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
+                    >
+                      <option value="">No category</option>
+                      {/* Categories will be loaded dynamically */}
+                    </select>
+                  </div>
                   
                   <div className="flex gap-3 pt-4">