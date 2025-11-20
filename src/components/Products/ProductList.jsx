// components/ProductList.js
import React from 'react';
import { Plus, RefreshCw, Search, Eye, Edit, Trash2, Star, ShoppingCart } from 'lucide-react';
import ProductStats from './ProductStats';

const ProductList = ({
  products,
  categories,
  loading,
  searchTerm,
  filterCategory,
  filterStatus,
  onSearchChange,
  onCategoryFilterChange,
  onStatusFilterChange,
  onAddNew,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  getCategoryName,
  getSubCategoryName
}) => {
  const getProductStats = () => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
    const inStock = products.filter(p => (p.stock || 0) > 10).length;

    return { totalProducts, outOfStock, lowStock, inStock };
  };

  const stats = getProductStats();

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Product Management</h2>
          <p className="text-gray-600 mt-2">Manage your products and inventory</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>

          <button
            onClick={onRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-blue-600 p-3 rounded-xl shadow-md transition-all duration-300 hover:rotate-180 border border-gray-200"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Stats */}
        <ProductStats stats={stats} />
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-8">
            <div className="flex justify-center items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-500">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No products found</div>
            <button
              onClick={onAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Stock</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-right text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-300 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-blue-200"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                          <ShoppingCart className="text-gray-400" size={20} />
                        </div>
                      )}
                      <div>
                        <div className="text-gray-800 font-medium">{product.name}</div>
                        <div className="text-gray-500 text-sm">{product.sku}</div>
                        {product.isFeatured && (
                          <Star className="text-yellow-500 inline" size={14} />
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-gray-700">
                      <div>{getCategoryName(product.categoryId)}</div>
                      <div className="text-gray-500 text-sm">
                        {getSubCategoryName(product.subCategoryId)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-gray-800 font-medium">
                      ₹{product.salePrice || product.price}
                    </div>
                    {product.salePrice && (
                      <div className="text-gray-500 text-sm line-through">
                        ₹{product.price}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-700' 
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex space-x-2 justify-end">
                      <button
                        onClick={() => onView(product)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => onEdit(product)}
                        className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(product.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;