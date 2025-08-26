@@ .. @@
 import React from 'react';
 import { Link, useLocation } from 'react-router-dom';
-import { MapPin, Rows, Sprout } from 'lucide-react';
+import { MapPin, Rows, Sprout, Home } from 'lucide-react';
 import { AuthButton } from './AuthButton';
@@ .. @@
   const navigation = [
+    { name: 'Dashboard', href: '/', icon: Home },
     { name: 'Plots', href: '/plots', icon: MapPin },
     { name: 'Rows', href: '/rows', icon: Rows },
   ];