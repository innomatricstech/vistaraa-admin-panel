import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  X,
  Camera,
  Edit,
  Trash2,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// FIREBASE IMPORTS
import { db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ================================
// INLINE CATEGORY SERVICE
// ================================

const categoryCollection = collection(db, "categories");

const uploadFile = async (folder, file) => {
  if (!file) return null;

  const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

const categoryService = {
  getAll: async () => {
    const snap = await getDocs(categoryCollection);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  add: async (data, files) => {
    const image = await uploadFile("category_images", files.image);
    const banner = await uploadFile("category_banners", files.banner);
    const icon = await uploadFile("category_icons", files.icon);

    const newData = {
      ...data,
      image,
      banner,
      icon,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(categoryCollection, newData);
    return { id: docRef.id, ...newData };
  },

  update: async (id, data, files) => {
    const updated = { ...data };

    if (files.image)
      updated.image = await uploadFile("category_images", files.image);
    if (files.banner)
      updated.banner = await uploadFile("category_banners", files.banner);
    if (files.icon)
      updated.icon = await uploadFile("category_icons", files.icon);

    await updateDoc(doc(db, "categories", id), updated);
    return { id, ...updated };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, "categories", id));
  },
};

// ================================
// CATEGORY COMPONENT
// ================================

const defaultMobileAttributes = ["RAM", "ROM", "Processor"];

const Category = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [previewIcon, setPreviewIcon] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    commissionType: "percent",
    commissionValue: 0.0,
    requiredAttributes: [],
    image: null,
    banner: null,
    icon: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetched = await categoryService.getAll();
      setCategories(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === "number" ? parseFloat(value) : value;

    let updated = { ...formData, [name]: finalValue };

    if (name === "name" && value.toLowerCase() === "mobile") {
      updated.requiredAttributes = [
        ...new Set([...updated.requiredAttributes, ...defaultMobileAttributes]),
      ];
    }

    setFormData(updated);
  };

  const addAttribute = (attr) => {
    attr = attr.trim();
    if (!attr) return;

    if (!formData.requiredAttributes.includes(attr)) {
      setFormData((prev) => ({
        ...prev,
        requiredAttributes: [...prev.requiredAttributes, attr],
      }));
    }
  };

  const removeAttribute = (attr) => {
    setFormData((prev) => ({
      ...prev,
      requiredAttributes: prev.requiredAttributes.filter((a) => a !== attr),
    }));
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "image") {
        setPreviewImage(reader.result);
        setImageFile(file);
      }
      if (type === "banner") {
        setPreviewBanner(reader.result);
        setBannerFile(file);
      }
      if (type === "icon") {
        setPreviewIcon(reader.result);
        setIconFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = (type) => {
    if (type === "image") {
      setPreviewImage(null);
      setImageFile(null);
      setFormData((p) => ({ ...p, image: null }));
    }
    if (type === "banner") {
      setPreviewBanner(null);
      setBannerFile(null);
      setFormData((p) => ({ ...p, banner: null }));
    }
    if (type === "icon") {
      setPreviewIcon(null);
      setIconFile(null);
      setFormData((p) => ({ ...p, icon: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = {
        name: formData.name.trim(),
        isActive: formData.isActive,
        commissionType: formData.commissionType,
        commissionValue: formData.commissionValue,
        requiredAttributes: formData.requiredAttributes,
        image: formData.image,
        banner: formData.banner,
        icon: formData.icon,
      };

      const files = {
        image: imageFile,
        banner: bannerFile,
        icon: iconFile,
      };

      if (selectedCategory) {
        const updated = await categoryService.update(
          selectedCategory.id,
          data,
          files
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? updated : c))
        );
      } else {
        const newCat = await categoryService.add(data, files);
        setCategories((prev) => [newCat, ...prev]);
      }

      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Error saving category!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      isActive: true,
      commissionType: "percent",
      commissionValue: 0.0,
      requiredAttributes: [],
      image: null,
      banner: null,
      icon: null,
    });

    setPreviewImage(null);
    setPreviewBanner(null);
    setPreviewIcon(null);

    setImageFile(null);
    setBannerFile(null);
    setIconFile(null);

    setIsModalOpen(false);
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setFormData(cat);

    setPreviewImage(cat.image);
    setPreviewBanner(cat.banner);
    setPreviewIcon(cat.icon);

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categories.filter((c) =>
      (c.name || "").toLowerCase().includes(term)
    );
  }, [searchTerm, categories]);

  // ===============================
  // UI (with RED THEME)
  // ===============================

  return (
    <div className="p-6 bg-gray-900 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-white">Category Management</h2>

        <div className="flex space-x-3">
          <button
            onClick={() => { handleCancel(); setIsModalOpen(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Category</span>
          </button>

          <button
            onClick={fetchCategories}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-white font-medium hidden sm:block">
          Categories ({filtered.length})
        </h3>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden lg:block">
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-gray-300">Commission</th>
              <th className="px-6 py-3 text-left text-gray-300">Active</th>
              <th className="px-6 py-3 text-left text-gray-300">Image</th>
              <th className="px-6 py-3 text-right text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-400 py-4"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-gray-200">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {cat.commissionValue}
                    {cat.commissionType === "percent" ? "%" : " ₹"}
                  </td>

                  <td className="px-6 py-4">
                    {cat.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="text-gray-500" />
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-4">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="bg-gray-800 p-4 rounded-lg flex justify-between"
          >
            <div className="flex space-x-4">
              {cat.image ? (
                <img
                  src={cat.image}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 bg-gray-700 rounded-full flex justify-center items-center">
                  <Camera className="text-gray-500" />
                </div>
              )}

              <div>
                <h3 className="text-white text-lg font-semibold">
                  {cat.name}
                </h3>
                <p className="text-gray-400">
                  {cat.commissionValue}
                  {cat.commissionType === "percent" ? "%" : " ₹"}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(cat)}
                className="p-2 bg-gray-700 rounded-lg text-red-300"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 bg-gray-700 rounded-lg text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl text-white font-bold">
                {selectedCategory ? "Edit Category" : "Add Category"}
              </h3>

              <button
                onClick={handleCancel}
                className="text-gray-300 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* IMAGE BLOCK */}
              <div className="grid grid-cols-3 gap-4 mb-5">

                {/* MAIN */}
                <div className="relative">
                  <input
                    type="file"
                    id="main-img"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "image")}
                  />

                  <label
                    htmlFor="main-img"
                    className="bg-gray-700 border border-gray-600 rounded-lg h-28 flex items-center justify-center cursor-pointer"
                  >
                    {previewImage ? (
                      <>
                        <img
                          src={previewImage}
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => clearFile("image")}
                          className="absolute top-1 right-1 bg-red-600 p-1 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <Camera className="text-gray-400" size={30} />
                    )}
                  </label>

                  <p className="text-xs text-gray-400 text-center mt-1">
                    Main
                  </p>
                </div>

                {/* BANNER */}
                <div className="relative">
                  <input
                    type="file"
                    id="banner-img"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "banner")}
                  />

                  <label
                    htmlFor="banner-img"
                    className="bg-gray-700 border border-gray-600 rounded-lg h-28 flex items-center justify-center cursor-pointer"
                  >
                    {previewBanner ? (
                      <>
                        <img
                          src={previewBanner}
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => clearFile("banner")}
                          className="absolute top-1 right-1 bg-red-600 p-1 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <Camera className="text-gray-400" size={30} />
                    )}
                  </label>

                  <p className="text-xs text-gray-400 text-center mt-1">
                    Banner
                  </p>
                </div>

                {/* ICON */}
                <div className="relative">
                  <input
                    type="file"
                    id="icon-img"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "icon")}
                  />

                  <label
                    htmlFor="icon-img"
                    className="bg-gray-700 border border-gray-600 rounded-lg h-28 flex items-center justify-center cursor-pointer"
                  >
                    {previewIcon ? (
                      <>
                        <img
                          src={previewIcon}
                          className="h-full w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => clearFile("icon")}
                          className="absolute top-1 right-1 bg-red-600 p-1 text-white rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <Camera className="text-gray-400" size={30} />
                    )}
                  </label>

                  <p className="text-xs text-gray-400 text-center mt-1">
                    Icon
                  </p>
                </div>
              </div>

              {/* NAME */}
              <div className="mb-4">
                <label className="text-gray-300 mb-1 block">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                />
              </div>

              {/* ACTIVE */}
              <div className="flex justify-between items-center mb-4">
                <label className="text-gray-300">Active Status</label>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                >
                  {formData.isActive ? (
                    <ToggleRight size={34} className="text-red-500" />
                  ) : (
                    <ToggleLeft size={34} className="text-gray-500" />
                  )}
                </button>
              </div>

              {/* COMMISSION */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-300 mb-1 block">
                    Commission Type
                  </label>
                  <select
                    name="commissionType"
                    value={formData.commissionType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 mb-1 block">
                    Commission Value
                  </label>
                  <input
                    type="number"
                    name="commissionValue"
                    value={formData.commissionValue}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              {/* ATTRIBUTES */}
              <div className="mb-4">
                <label className="text-gray-300 mb-2 block">
                  Required Attributes
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.requiredAttributes.map((attr) => (
                    <div
                      key={attr}
                      className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-2"
                    >
                      <span>{attr}</span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(attr)}
                        className="hover:text-gray-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Add attribute + press Enter"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAttribute(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                >
                  {loading ? "Saving..." : selectedCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
