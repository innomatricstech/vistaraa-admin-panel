import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductManagement from './components/Products/ProductManagement';
import Category from './pages/Category';
import SubCategory from './pages/SubCategory';
import SubUnderCategory from './pages/SubUnderCategory';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div className="flex bg-gray-900 min-h-screen">

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

          {/* Header */}
          <Header onToggleSidebar={toggleSidebar} />

          {/* Main content */}
          <main className="flex-1 overflow-auto bg-gray-900">
            <Routes>
 <Route path="/" element={<Dashboard/>} />
 <Route path="/products" element={<ProductManagement/>}/>

              {/* Default route */}
              <Route path="/" element={<Category />} />

              {/* Category page */}
              <Route path="/category" element={<Category />} />

              {/* Sub Category page */}
              <Route path="/sub-category" element={<SubCategory />} />

               <Route path="/sub-under-category" element={<SubUnderCategory />} />

            </Routes>
          </main>

        </div>

      </div>
    </Router>
  );
};

export default App;
