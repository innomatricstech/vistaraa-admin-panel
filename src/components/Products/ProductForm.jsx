// components/ProductForm.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Camera, 
  Package, 
  X,
  Info,
  Tag,
  DollarSign,
  Hash,
  User,
  Palette,
  Ruler,
  Weight,
  Barcode,
  Layers,
  Cpu,
  Smartphone,
  Gem,
  Book,
  Home,
  Heart,
  Sofa,
  ShoppingBag,
  Laptop,
  Footprints
} from 'lucide-react';

import { db, storage } from "../../../firebase";
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProductForm = ({ mode, product, categories, subCategories, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    sku: '',
    brand: '',
    isActive: true,
    isFeatured: false,
    hsnCode: '',
    sellerId: '',
    weight: '',
    dimensions: '',
    colors: [],
    sizes: [],
    images: []
  });

  // Category-specific fields
  const [categoryFields, setCategoryFields] = useState({
    // Fashion/Clothing
    material: '',
    fit: '',
    pattern: '',
    sleevetype: '',
    careinstruction: '',
    sizeoptions: [],
    fittype: '',
    gender: '',
    necktype: '',
    occasion: '',
    stitchtype: '',
    vendor: '',
    variantsku: '',
    closuretype: '',
    embroiderystyle: '',
    lining: '',
    model: '',
    neckstyle: '',
    padtype: '',
    pockets: '',
    printtype: '',
    productlength: '',
    producttype: '',
    risestyle: '',
    sidetype: '',
    sleeve: '',
    sleevestyle: '',
    slittype: '',
    specialfeatures: '',
    straptype: '',
    style: '',
    transparent: '',
    type: '',
    worktype: '',
    blouseavailability: '',
    patterncoverage: '',
    age: '',
    agegroup: '',
    waiststyle: '',

    // Mobile
    mobilecolor: '',
    ram: '',
    storage: '',
    battery: '',
    camera: '',
    processor: '',
    display: '',
    os: '',
    connectivity: '',
    warranty: '',
    color: '',
    designoptions: '',

    // Electronics
    resolution: '',
    displaytype: '',
    smartfeatures: '',
    energyrating: '',
    powerconsumption: '',
    expdate: '',
    mfgdate: '',
    highlight: '',
    otherhighlights: '',

    // Jewellery
    jewellerymaterial: '',
    purity: '',
    jewelleryweight: '',
    jewellerycolor: '',
    jewellerysize: '',
    gemstone: '',
    certification: '',

    // Book
    title: '',
    author: '',
    publisher: '',
    edition: '',
    language: '',
    isbn: '',
    pages: '',
    binding: '',
    genre: '',

    // Home & Kitchen
    framematerial: '',
    mountingtype: '',

    // Beauty
    shadecolor: '',
    beautytype: '',
    ingredients: [],
    skinhairtype: '',
    beautyweightvolume: '',
    beautyexpirydate: '',
    dermatologicallytested: '',

    // Furniture
    dimension: '',
    weightcapacity: '',
    assembly: '',
    roomtype: '',

    // Grocery
    weightvolume: '',
    quantity: '',
    organic: '',
    expirydate: '',
    storageinstruction: '',
    dietarypreference: '',

    // Laptop
    graphics: '',
    screensize: '',
    operatingsystem: '',
    port: '',

    // Footwear
    footwearmaterial: '',
    footweartype: '',
    shoesize: '',
    heelheight: '',
    solematerial: '',
    toeshape: ''
  });

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        ...product,
        price: product.price || 0,
        salePrice: product.salePrice || 0,
        stock: product.stock || 0
      });
      setImagePreviews(product.images || []);
      setSizeVariants(product.sizeVariants || []);
      
      // Set category-specific fields if they exist
      if (product.categoryFields) {
        setCategoryFields(product.categoryFields);
      }
    }
  }, [mode, product]);

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subCategories.filter(subCat => subCat.categoryId === formData.categoryId);
      setFilteredSubCategories(filtered);
      if (mode === 'add') {
        setFormData(prev => ({ ...prev, subCategoryId: '' }));
      }
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.categoryId, subCategories, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCategoryFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFields(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);

    if (validFiles.length > 0) {
      setUploadingImages(true);
      setImageFiles(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
          setUploadingImages(false);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeImage = (index) => {
    if (mode === 'edit' && index < formData.images.length) {
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: updatedImages }));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = mode === 'edit' ? index - formData.images.length : index;
      setImageFiles(prev => prev.filter((_, i) => i !== newIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImagesToFirebase = async (files) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = `product_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `products/${fileName}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const addSizeVariant = () => {
    setSizeVariants(prev => [...prev, { size: '', price: '', sku: '', stock: '' }]);
  };

  const updateSizeVariant = (index, field, value) => {
    setSizeVariants(prev => 
      prev.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeSizeVariant = (index) => {
    setSizeVariants(prev => prev.filter((_, i) => i !== index));
  };

  const getCategoryName = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.name || "";
  };

  const getCurrentCategoryName = () => {
    return getCategoryName(formData.categoryId).toLowerCase();
  };

  // Function to get category-specific field groups
  const getCategoryFieldGroups = () => {
    const categoryName = getCurrentCategoryName();
    
    const fieldGroups = {
      // Fashion/Clothing
      fashion: [
        'material', 'fit', 'pattern', 'sleevetype', 'careinstruction', 'sizeoptions',
        'fittype', 'gender', 'necktype', 'occasion', 'stitchtype', 'vendor',
        'variantsku', 'closuretype', 'embroiderystyle', 'lining', 'model', 'neckstyle',
        'padtype', 'pockets', 'printtype', 'productlength', 'producttype', 'risestyle',
        'sidetype', 'sleeve', 'sleevestyle', 'slittype', 'specialfeatures', 'straptype',
        'style', 'transparent', 'type', 'worktype', 'blouseavailability', 'patterncoverage',
        'age', 'agegroup', 'waiststyle'
      ],
      clothing: [
        'material', 'fit', 'pattern', 'sleevetype', 'careinstruction', 'sizeoptions',
        'fittype', 'gender', 'necktype', 'occasion', 'stitchtype', 'vendor',
        'variantsku', 'closuretype', 'embroiderystyle', 'lining', 'model', 'neckstyle',
        'padtype', 'pockets', 'printtype', 'productlength', 'producttype', 'risestyle',
        'sidetype', 'sleeve', 'sleevestyle', 'slittype', 'specialfeatures', 'straptype',
        'style', 'transparent', 'type', 'worktype', 'blouseavailability', 'patterncoverage',
        'age', 'agegroup', 'waiststyle'
      ],
      // Mobile
      mobile: [
        'mobilecolor', 'ram', 'storage', 'battery', 'camera', 'processor',
        'display', 'os', 'connectivity', 'warranty', 'color', 'designoptions'
      ],
      smartphone: [
        'mobilecolor', 'ram', 'storage', 'battery', 'camera', 'processor',
        'display', 'os', 'connectivity', 'warranty', 'color', 'designoptions'
      ],
      // Electronics
      electronics: [
        'resolution', 'displaytype', 'smartfeatures', 'energyrating', 'powerconsumption',
        'expdate', 'mfgdate', 'highlight', 'otherhighlights'
      ],
      // Jewellery
      jewellery: [
        'jewellerymaterial', 'purity', 'jewelleryweight', 'jewellerycolor',
        'jewellerysize', 'gemstone', 'certification'
      ],
      // Book
      books: [
        'title', 'author', 'publisher', 'edition', 'language', 'isbn',
        'pages', 'binding', 'genre'
      ],
      // Home & Kitchen
      home: ['framematerial', 'mountingtype'],
      kitchen: ['framematerial', 'mountingtype'],
      // Beauty
      beauty: [
        'shadecolor', 'beautytype', 'ingredients', 'skinhairtype',
        'beautyweightvolume', 'beautyexpirydate', 'dermatologicallytested'
      ],
      // Furniture
      furniture: ['dimension', 'weightcapacity', 'assembly', 'roomtype'],
      // Grocery
      grocery: [
        'weightvolume', 'quantity', 'organic', 'expirydate',
        'storageinstruction', 'dietarypreference'
      ],
      // Laptop
      laptop: ['graphics', 'screensize', 'operatingsystem', 'port'],
      // Footwear
      footwear: [
        'footwearmaterial', 'footweartype', 'shoesize', 'heelheight',
        'solematerial', 'toeshape'
      ]
    };

    // Return the relevant field group based on category name
    for (const [key, fields] of Object.entries(fieldGroups)) {
      if (categoryName.includes(key)) {
        return fields;
      }
    }
    
    return []; // Return empty array if no matching category found
  };

  // Function to remove empty fields and keep only relevant category fields
  const cleanCategoryFields = () => {
    const relevantFields = getCategoryFieldGroups();
    const cleaned = {};

    // Only include fields that are relevant to the current category AND have values
    relevantFields.forEach(field => {
      const value = categoryFields[field];
      // Check if value is not empty
      if (value !== '' && 
          value !== null && 
          value !== undefined && 
          !(Array.isArray(value) && value.length === 0)
      ) {
        cleaned[field] = value;
      }
    });

    return cleaned;
  };

  // Function to remove empty fields from main form data
  const removeEmptyFields = (obj) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if value is not empty (for strings, arrays, numbers)
      if (value !== '' && 
          value !== null && 
          value !== undefined && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'number' && value === 0 && key !== 'price' && key !== 'stock') // Keep price and stock even if 0
      ) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const renderCategorySpecificFields = () => {
    const categoryName = getCurrentCategoryName();
    
    switch(categoryName) {
      case 'fashion':
      case 'clothing':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User size={20} />
              Clothing Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  name="material"
                  value={categoryFields.material}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fit Type</label>
                <input
                  type="text"
                  name="fittype"
                  value={categoryFields.fittype}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={categoryFields.gender}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Occasion</label>
                <input
                  type="text"
                  name="occasion"
                  value={categoryFields.occasion}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case 'mobile':
      case 'smartphone':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Smartphone size={20} />
              Mobile Specifications
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">RAM</label>
                <input
                  type="text"
                  name="ram"
                  value={categoryFields.ram}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Storage</label>
                <input
                  type="text"
                  name="storage"
                  value={categoryFields.storage}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Battery</label>
                <input
                  type="text"
                  name="battery"
                  value={categoryFields.battery}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Processor</label>
                <input
                  type="text"
                  name="processor"
                  value={categoryFields.processor}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case 'electronics':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Cpu size={20} />
              Electronics Specifications
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resolution</label>
                <input
                  type="text"
                  name="resolution"
                  value={categoryFields.resolution}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Display Type</label>
                <input
                  type="text"
                  name="displaytype"
                  value={categoryFields.displaytype}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Energy Rating</label>
                <input
                  type="text"
                  name="energyrating"
                  value={categoryFields.energyrating}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Power Consumption</label>
                <input
                  type="text"
                  name="powerconsumption"
                  value={categoryFields.powerconsumption}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case 'jewellery':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gem size={20} />
              Jewellery Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  name="jewellerymaterial"
                  value={categoryFields.jewellerymaterial}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purity</label>
                <input
                  type="text"
                  name="purity"
                  value={categoryFields.purity}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                <input
                  type="text"
                  name="jewelleryweight"
                  value={categoryFields.jewelleryweight}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      case 'books':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Book size={20} />
              Book Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  value={categoryFields.author}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={categoryFields.publisher}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={categoryFields.isbn}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={categoryFields.pages}
                  onChange={handleCategoryFieldChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        );

      // Add more cases for other categories...

      default:
        return (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No specific fields for this category</p>
            <p className="text-sm text-gray-500 mt-1">Basic product information is sufficient</p>
          </div>
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Upload new images
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        newImageUrls = await uploadImagesToFirebase(imageFiles);
      }

      // Combine images
      const allImageUrls = mode === 'edit' 
        ? [...formData.images, ...newImageUrls]
        : newImageUrls;

      // Process size variants
      const processedSizeVariants = sizeVariants
        .filter(variant => variant.size && variant.price)
        .map(variant => ({
          size: variant.size,
          price: parseFloat(variant.price) || 0,
          sku: variant.sku,
          stock: parseInt(variant.stock) || 0
        }));

      // Clean form data - remove empty fields
      const cleanedFormData = removeEmptyFields({
        ...formData,
        price: parseFloat(formData.price),
        salePrice: parseFloat(formData.salePrice) || 0,
        stock: parseInt(formData.stock) || 0,
        images: allImageUrls,
        sizeVariants: processedSizeVariants.length > 0 ? processedSizeVariants : undefined
      });

      // Clean category-specific fields - keep only relevant fields with values
      const cleanedCategoryFields = cleanCategoryFields();

      const productData = {
        ...cleanedFormData,
        updatedAt: serverTimestamp(),
        // Only include categoryFields if there are any non-empty values
        ...(Object.keys(cleanedCategoryFields).length > 0 && { categoryFields: cleanedCategoryFields })
      };

      console.log('Final product data to save:', productData); // For debugging

      if (mode === 'edit') {
        await updateDoc(doc(db, "products", product.id), productData);
        alert('Product updated successfully!');
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), productData);
        alert('Product added successfully!');
      }

      onSave();
      onCancel();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'pricing', label: 'Pricing & Stock', icon: Tag },
    { id: 'category', label: 'Category Details', icon: Package },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'variants', label: 'Variants', icon: Layers },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <select
                      name="subCategoryId"
                      value={formData.subCategoryId}
                      onChange={handleInputChange}
                      disabled={!formData.categoryId}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100"
                    >
                      <option value="">Select Subcategory</option>
                      {filteredSubCategories.map(subCat => (
                        <option key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Pricing Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Inventory</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      name="hsnCode"
                      value={formData.hsnCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Seller ID
                    </label>
                    <input
                      type="text"
                      name="sellerId"
                      value={formData.sellerId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Active Product</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Featured Product</label>
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="space-y-6">
            {formData.categoryId ? (
              renderCategorySpecificFields()
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select a category first</p>
                <p className="text-sm text-gray-500 mt-1">Choose a category to see specific fields</p>
              </div>
            )}
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Product Images
                {uploadingImages && (
                  <span className="text-blue-600 text-sm ml-2">(Uploading...)</span>
                )}
              </label>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Image Upload Area */}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300 hover:border-blue-500">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">Upload Images</p>
                  <span className="text-xs text-gray-500 mt-1">Max 5MB each</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                </label>

                {/* Image Previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'variants':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Size Variants</h3>
              <button
                type="button"
                onClick={addSizeVariant}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
              >
                <Plus size={18} />
                Add Size Variant
              </button>
            </div>

            {sizeVariants.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No size variants added yet</p>
                <p className="text-sm text-gray-500 mt-1">Add your first size variant to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sizeVariants.map((variant, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-800">Variant #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSizeVariant(index)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Size</label>
                        <input
                          type="text"
                          placeholder="e.g., S, M, L"
                          value={variant.size}
                          onChange={(e) => updateSizeVariant(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) => updateSizeVariant(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">SKU</label>
                        <input
                          type="text"
                          placeholder="Variant SKU"
                          value={variant.sku}
                          onChange={(e) => updateSizeVariant(index, 'sku', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Stock</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={variant.stock}
                          onChange={(e) => updateSizeVariant(index, 'stock', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const title = mode === 'edit' ? 'Edit Product' : 'Add New Product';

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 mt-2">
              {mode === 'edit' ? 'Update product information' : 'Create a new product listing'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {renderTabContent()}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'edit' ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {mode === 'edit' ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;