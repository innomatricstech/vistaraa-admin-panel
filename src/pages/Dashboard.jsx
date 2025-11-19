import React, { useState, useEffect } from 'react';
import { 
  Plus, RefreshCw, MoreVertical, Package, AlertTriangle, Clock, 
  Archive, Truck, CheckCircle, X, Camera, Edit, Trash2, Upload, 
  Search, Filter, ChevronDown, ChevronUp, Eye,
  DollarSign, Hash, User, Tag, Ruler, Weight, Calendar,
  Layers, Barcode, Globe, Shield, Truck as TruckIcon
} from 'lucide-react';
import "../../firebase"
// import BulkUpload from '../components/BulkUpload';
// import AddProduct from '../components/AddProduct';
// import { bulkUploadProducts } from '../firebase/bulkUploadService';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Fetch data from Firebase on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply filters and search when dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsncode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerid?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply status filter (stock status)
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'in-stock':
          filtered = filtered.filter(product => (product.stock || 0) > 10);
          break;
        case 'low-stock':
          filtered = filtered.filter(product => (product.stock || 0) > 0 && (product.stock || 0) <= 10);
          break;
        case 'out-of-stock':
          filtered = filtered.filter(product => (product.stock || 0) === 0);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (sortBy === 'price' || sortBy === 'stock') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [productsData, categoriesData, subCategoriesData, ordersData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        subCategoryService.getAll(),
        orderService.getAll()
      ]);
      
      // Normalize product data
      const productsWithNames = productsData.map(product => {
        const displayName = (
          product.name || product.title || product.productName || 
          product.product_name || 'Unknown Product'
        );

        let categoryName = 'No Category';
        if (product.category) categoryName = product.category;
        else if (product.categoryId) {
          const category = categoriesData.find(cat => cat.id === product.categoryId);
          categoryName = category ? (category.name || category.categoryName) : 'Unknown Category';
        }

        let subCategoryName = 'Unknown SubCategory';
        if (product.subCategory) subCategoryName = product.subCategory;
        else if (product.subcategory) subCategoryName = product.subcategory;
        else if (product.subCategoryName) subCategoryName = product.subCategoryName;
        else if (product.subCategoryId) {
          const subCategory = subCategoriesData.find(
            subCat =>
              subCat.id === product.subCategoryId ||
              subCat.name === product.subCategoryId ||
              subCat.subCategoryName === product.subCategoryId
          );
          subCategoryName = subCategory ? (subCategory.name || subCategory.subCategoryName || subCategory.categoryName) : 'Unknown SubCategory';
        }

        const priceRaw = product.price ?? product.Price ?? 0;
        const normalizedPrice = parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0;

        // Handle the new field names
        const height = product["height(cm)"] || product.height || '';
        const width = product["width(cm)"] || product.width || '';
        const length = product["length(cm)"] || product.length || '';
        const weight = product["weight(g)"] || product.weight || '';

        return {
          ...product,
          name: displayName,
          category: categoryName,
          subCategory: subCategoryName,
          price: normalizedPrice,
          hsncode: product.hsncode || 'N/A',
          sellerid: product.sellerid || 'N/A',
          "height(cm)": height,
          "width(cm)": width,
          "length(cm)": length,
          "weight(g)": weight
        };
      });
      
      // Calculate order statistics
      const stats = {
        all: ordersData.length,
        pending: ordersData.filter(order => order.orderStatus === 'pending').length,
        processing: ordersData.filter(order => order.orderStatus === 'processing').length,
        shipped: ordersData.filter(order => order.orderStatus === 'shipped').length,
        delivered: ordersData.filter(order => order.orderStatus === 'delivered').length,
        cancelled: ordersData.filter(order => order.orderStatus === 'cancelled').length
      };
      
      setOrderStats(stats);
      setProducts(productsWithNames);
      setCategories(categoriesData);
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced product statistics with real data
  const getProductStats = () => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
    const inStock = products.filter(p => (p.stock || 0) > 10).length;

    return [
      {
        title: 'All Products',
        count: totalProducts,
        formattedCount: `${totalProducts} Product${totalProducts !== 1 ? 's' : ''}`,
        icon: Package,
        color: 'bg-blue-500',
        iconBg: 'bg-blue-100',
        trend: '+12%',
        description: 'Total products in catalog'
      },
      {
        title: 'Out of Stock',
        count: outOfStock,
        formattedCount: `${outOfStock} Product${outOfStock !== 1 ? 's' : ''}`,
        icon: AlertTriangle,
        color: 'bg-red-500',
        iconBg: 'bg-red-100',
        trend: outOfStock > 0 ? 'Attention Needed' : 'All Good',
        description: 'Products need restocking'
      },
      {
        title: 'Low Stock',
        count: lowStock,
        formattedCount: `${lowStock} Product${lowStock !== 1 ? 's' : ''}`,
        icon: Clock,
        color: 'bg-yellow-500',
        iconBg: 'bg-yellow-100',
        trend: lowStock > 0 ? 'Restock Soon' : 'Optimal',
        description: 'Products running low'
      },
      {
        title: 'In Stock',
        count: inStock,
        formattedCount: `${inStock} Product${inStock !== 1 ? 's' : ''}`,
        icon: Archive,
        color: 'bg-green-500',
        iconBg: 'bg-green-100',
        trend: '+5%',
        description: 'Adequately stocked'
      }
    ];
  };

  // Quick Actions
  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create new product listing',
      icon: Plus,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      action: () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
      }
    },
    {
      title: 'Bulk Upload',
      description: 'Upload multiple products',
      icon: Upload,
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      action: () => setIsBulkUploadModalOpen(true)
    }
  ];

  const handleBulkUpload = async (productsData) => {
    try {
      setLoading(true);
      
      const results = await bulkUploadProducts(
        productsData,
        (progress, uploaded, total) => {
          console.log(`Upload progress: ${progress}% (${uploaded}/${total})`);
        }
      );
      
      console.log('Upload completed:', results);
      
      if (results.success && results.success.length > 0) {
        // Refresh products list to show newly uploaded products
        await fetchAllData();
        
        // Show success message with ID count
        alert(`Successfully uploaded ${results.success.length} products with unique IDs!${results.errors && results.errors.length > 0 ? ` ${results.errors.length} products failed.` : ''}`);
      }
      
      if (results.errors && results.errors.length > 0) {
        console.error('Upload errors:', results.errors);
      }
      
    } catch (error) {
      console.error('Bulk upload failed:', error);
      alert(`Bulk upload failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await productService.delete(id);
        setProducts(prev => prev.filter(product => product.id !== id));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Error deleting product: ${error.message}. Please try again.`);
        fetchAllData();
      } finally {
        setLoading(false);
      }
    }
  };

  // FIXED: Enhanced handleProductAdded function to properly update products state
  const handleProductAdded = (newProduct, action) => {
    console.log('Product added/updated:', { newProduct, action });
    
    if (action === 'added') {
      // Add new product to the beginning of the list
      setProducts(prev => [newProduct, ...prev]);
    } else if (action === 'updated') {
      // Update existing product with all new data including images
      setProducts(prev => prev.map(p => {
        if (p.id === newProduct.id) {
          console.log('Updating product:', { old: p, new: newProduct });
          // Return the complete new product data to ensure images are updated
          return {
            ...newProduct,
            // Ensure all fields are properly set
            name: newProduct.name || p.name,
            category: newProduct.category || p.category,
            subCategory: newProduct.subCategory || p.subCategory,
            price: newProduct.price || p.price,
            stock: newProduct.stock || p.stock,
            images: newProduct.images || p.images, // This is crucial for image updates
            hsncode: newProduct.hsncode || p.hsncode,
            sellerid: newProduct.sellerid || p.sellerid
          };
        }
        return p;
      }));
    }
    
    setSelectedProduct(null);
    
    // Refresh the data to ensure everything is in sync
    setTimeout(() => {
      fetchAllData();
    }, 500);
  };

  const getOrderStatsForDisplay = () => [
    { label: 'All Orders', count: `${orderStats.all} Order${orderStats.all !== 1 ? 's' : ''}`, color: 'text-purple-600', icon: Package },
    { label: 'Pending Orders', count: `${orderStats.pending} Order${orderStats.pending !== 1 ? 's' : ''}`, color: 'text-yellow-600', icon: Clock },
    { label: 'Processed Orders', count: `${orderStats.processing} Order${orderStats.processing !== 1 ? 's' : ''}`, color: 'text-blue-600', icon: Truck },
    { label: 'Cancelled Orders', count: `${orderStats.cancelled} Order${orderStats.cancelled !== 1 ? 's' : ''}`, color: 'text-red-600', icon: AlertTriangle },
    { label: 'Shipped Orders', count: `${orderStats.shipped} Order${orderStats.shipped !== 1 ? 's' : ''}`, color: 'text-indigo-600', icon: Truck },
    { label: 'Delivered Orders', count: `${orderStats.delivered} Order${orderStats.delivered !== 1 ? 's' : ''}`, color: 'text-green-600', icon: CheckCircle }
  ];

  // Product Details Modal Component
  const ProductDetailsModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const getStockStatus = (stock) => {
      if (stock === 0) return { text: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/20' };
      if (stock <= 10) return { text: 'Low Stock', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      return { text: 'In Stock', color: 'text-green-400', bg: 'bg-green-500/20' };
    };

    const stockStatus = getStockStatus(product.stock || 0);

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white">Product Details</h2>
              <p className="text-gray-400">Complete information about {product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images & Basic Info */}
              <div className="space-y-6">
                {/* Product Images */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Camera size={20} />
                    Product Images
                  </h3>
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Camera size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No images available</p>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Product Name</span>
                      <span className="text-white font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Brand</span>
                      <span className="text-white">{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Category</span>
                      <span className="text-white">{product.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Subcategory</span>
                      <span className="text-white">{product.subCategory}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Description</span>
                      <span className="text-white text-right max-w-xs">
                        {product.description || 'No description available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Specifications */}
              <div className="space-y-6">
                {/* Pricing & Stock */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Pricing & Inventory
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Regular Price</span>
                      <span className="text-white font-semibold text-lg">₹{product.price}</span>
                    </div>
                    {product.offerprice && product.offerprice < product.price && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Offer Price</span>
                        <span className="text-green-400 font-semibold text-lg">₹{product.offerprice}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Stock Quantity</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {product.stock || 0} units
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Stock Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Identification */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Barcode size={20} />
                    Product Identification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Product ID</span>
                      <span className="text-white font-mono">{product.productid || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Base SKU</span>
                      <span className="text-white font-mono">{product.basesku || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">HSN Code</span>
                      <span className="text-white font-mono">{product.hsncode}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Seller ID</span>
                      <span className="text-white font-mono">{product.sellerid}</span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Ruler size={20} />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Ruler size={16} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Height</p>
                        <p className="text-white font-medium">{product["height(cm)"] || 'N/A'} cm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Ruler size={16} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Width</p>
                        <p className="text-white font-medium">{product["width(cm)"] || 'N/A'} cm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Ruler size={16} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Length</p>
                        <p className="text-white font-medium">{product["length(cm)"] || 'N/A'} cm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Weight size={16} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Weight</p>
                        <p className="text-white font-medium">{product["weight(g)"] || 'N/A'} g</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Attributes */}
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag size={20} />
                    Additional Attributes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Color</span>
                      <span className="text-white">{product.color || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Material</span>
                      <span className="text-white">{product.material || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Gender</span>
                      <span className="text-white">{product.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Occasion</span>
                      <span className="text-white">{product.occasion || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Size Variants */}
                {product.sizevariants && product.sizevariants.length > 0 && (
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Layers size={20} />
                      Size Variants
                    </h3>
                    <div className="space-y-2">
                      {product.sizevariants.map((variant, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <div>
                            <span className="text-white font-medium">{variant.size}</span>
                            <span className="text-gray-400 text-sm ml-2">SKU: {variant.sku}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">₹{variant.price}</div>
                            <div className="text-gray-400 text-sm">Stock: {variant.stock}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                handleEdit(product);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Product Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage your products and inventory</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              <button 
                onClick={fetchAllData}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} className="text-white" />
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* Product Stats with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getProductStats().map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <Icon size={24} className={stat.color.replace('bg-', 'text-')} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend.includes('+') ? 'bg-green-500/20 text-green-400' :
                    stat.trend.includes('Attention') ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-gray-300 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white">{stat.formattedCount}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Products Section */}
          <div className="flex-1">
            {/* Products Section */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
              {/* Table Header with Sorting */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Products</h2>
                    <p className="text-gray-400 text-sm">
                      Showing {currentItems.length} of {filteredProducts.length} products
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price">Sort by Price</option>
                      <option value="stock">Sort by Stock</option>
                      <option value="category">Sort by Category</option>
                      <option value="hsncode">Sort by HSN Code</option>
                      <option value="sellerid">Sort by Seller ID</option>
                    </select>

                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-1"
                      title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    >
                      {sortOrder === 'asc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      <span className="text-sm">{sortOrder === 'asc' ? 'Desc' : 'Asc'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                        HSN Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {loading ? (
                      // Enhanced Loading Skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                              <div>
                                <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-600 rounded w-24"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="h-4 bg-gray-600 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="h-4 bg-gray-600 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-gray-600 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="h-6 bg-gray-600 rounded w-12"></div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 bg-gray-600 rounded"></div>
                              <div className="w-8 h-8 bg-gray-600 rounded"></div>
                              <div className="w-8 h-8 bg-gray-600 rounded"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : currentItems.length > 0 ? (
                      currentItems.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                                {/* FIXED: Simplified image display logic */}
                                {product.images && product.images.length > 0 ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded-lg"
                                    onError={(e) => {
                                      // Show package icon if image fails to load
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Package size={20} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="text-white font-medium">{product.name}</div>
                                <div className="text-gray-400 text-sm">
                                  {product.brand && `${product.brand} • `} 
                                  Seller: {product.sellerid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 hidden md:table-cell">
                            <div>{product.category || 'No Category'}</div>
                            <div className="text-xs text-gray-400">{product.subCategory || 'No SubCategory'}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 hidden lg:table-cell">
                            <div className="font-mono text-sm">{product.hsncode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-semibold">₹{product.price}</div>
                            {product.offerprice && product.offerprice < product.price && (
                              <div className="text-green-400 text-sm">
                                ₹{product.offerprice}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (product.stock || 0) === 0 
                                ? 'bg-red-500/20 text-red-400'
                                : (product.stock || 0) <= 10
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {product.stock || 0} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleView(product)}
                                className="text-green-400 hover:text-green-300 p-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleEdit(product)}
                                className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Package size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No products found</p>
                            <p className="text-sm">
                              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Get started by adding your first product'
                              }
                            </p>
                            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                              <button
                                onClick={() => {
                                  setSearchTerm('');
                                  setSelectedCategory('all');
                                  setSelectedStatus('all');
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Orders Details */}
          <div className="w-full lg:w-80 flex-shrink-0 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Orders Overview</h2>
                <p className="text-gray-400 text-sm">Real-time order statistics</p>
              </div>
              <div className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {orderStats.all}
              </div>
            </div>

            {/* Order Stats */}
            <div className="space-y-4">
              {getOrderStatsForDisplay().map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-700 transition-colors">
                    <div className="p-2 bg-gray-600 rounded-lg flex-shrink-0">
                      <Icon size={18} className={stat.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{stat.label}</p>
                      <p className="text-base font-semibold text-white">{stat.count}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <h3 className="text-sm font-semibold text-white mb-2">Performance Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Conversion Rate</span>
                  <span className="text-green-400">+12.5%</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Avg. Order Value</span>
                  <span>₹2,450</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Customer Satisfaction</span>
                  <span className="text-green-400">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProduct
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onProductAdded={handleProductAdded}
        categories={categories}
        subCategories={subCategories}
        editingProduct={selectedProduct}
      />

      {/* Bulk Upload Modal */}
      <BulkUpload
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onUpload={handleBulkUpload}
        categories={categories}
        subCategories={subCategories}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={viewingProduct}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProduct(null);
        }}
      />
    </div>
  );
};

export default Dashboard;