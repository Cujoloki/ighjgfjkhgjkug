@@ .. @@
 import { RowsPage } from './pages/RowsPage';
+import { DashboardPage } from './pages/DashboardPage';
 import { AuthProvider } from './contexts/AuthContext';
@@ .. @@
           <Routes>
-            <Route path="/" element={<PlotsPage />} />
+            <Route path="/" element={<DashboardPage />} />
             <Route path="/plots" element={<PlotsPage />} />
             <Route path="/rows" element={<RowsPage />} />
           </Routes>