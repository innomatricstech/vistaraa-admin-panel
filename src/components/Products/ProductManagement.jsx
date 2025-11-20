// components/ProductManagement.js
import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";
import { Plus, RefreshCw } from "lucide-react";

// Import separated components
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import ProductDetails from "./ProductDetails";
import ProductStats from "./ProductStats";

const ProductManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [productsSnap, categoriesSnap, subCategoriesSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "subcategories"))
      ]);

      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSubCategories(subCategoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentView('add');
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setCurrentView('view');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(product => product.id !== id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product!");
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.categoryId === filterCategory;
      const matchesStatus = !filterStatus || 
                           (filterStatus === "active" && product.isActive) ||
                           (filterStatus === "inactive" && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered;
  }, [products, searchTerm, filterCategory, filterStatus]);

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  const getSubCategoryName = (subCategoryId) => {
    return subCategories.find(sub => sub.id === subCategoryId)?.name || "Unknown";
  };

  // Render based on current view
  switch (currentView) {
    case 'add':
      return (
        <ProductForm
          mode="add"
          categories={categories}
          subCategories={subCategories}
          onSave={fetchAll}
          onCancel={handleBackToList}
        />
      );

    case 'edit':
      return (
        <ProductForm
          mode="edit"
          product={selectedProduct}
          categories={categories}
          subCategories={subCategories}
          onSave={fetchAll}
          onCancel={handleBackToList}
        />
      );

    case 'view':
      return (
        <ProductDetails
          product={selectedProduct}
          categories={categories}
          subCategories={subCategories}
          onEdit={handleEdit}
          onClose={handleBackToList}
        />
      );

    default:
      return (
        <ProductList
          products={filteredProducts}
          categories={categories}
          subCategories={subCategories}
          loading={loading}
          searchTerm={searchTerm}
          filterCategory={filterCategory}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onCategoryFilterChange={setFilterCategory}
          onStatusFilterChange={setFilterStatus}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={fetchAll}
          getCategoryName={getCategoryName}
          getSubCategoryName={getSubCategoryName}
        />
      );
  }
};

export default ProductManagement;