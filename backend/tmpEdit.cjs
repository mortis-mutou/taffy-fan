const fs = require('fs');
const p = 'D:/taffy-fan-site/frontend/src/App.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  "import AdminDashboard from './pages/Admin/Dashboard';",
  "import ReviewPosts from './pages/Admin/ReviewPosts';\nimport AdminDashboard from './pages/Admin/Dashboard';"
);
c = c.replace(
  '<Route path="admin" element={',
  '<Route path="admin/review" element={token ? <ReviewPosts /> : <Navigate to="/login" />}/\n                    <Route path="admin" element={'
);
fs.writeFileSync(p, c, 'utf8');
console.log('Done!');