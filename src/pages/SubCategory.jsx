import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  X,
  Edit,
  Trash2,
  Search,
  Camera,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";

import { db, storage } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ========================================================
// 🔥 INLINE SERVICE (NO External Files Needed)
// ========================================================

const subCategoryCollection = collection(db, "subcategories");

const uploadImage = async (file) => {
  if (!file) return null;
  const imageRef = ref(storage, `subcategory/${Date.now()}_${file.name}`);
  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
};

const subCategoryService = {
  getAll: async () => {
    const snap = await getDocs(subCategoryCollection);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  add: async (data, file) => {
    const imageURL = await uploadImage(file);

    const newData = {
      ...data,
      image: imageURL,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(subCategoryCollection, newData);
    return { id: docRef.id, ...newData };
  },

  update: async (id, data, file) => {
    const updateData = { ...data };

    if (file) {
      updateData.image = await uploadImage(file);
    }

    await updateDoc(doc(db, "subcategories", id), updateData);
    return { id, ...updateData };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, "subcategories", id));
  },
};

// CATEGORY SERVICE INLINE (for dropdown)
const categoryService = {
  getAll: async () => {
    const snap = await getDocs(collection(db, "categories"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};

// ========================================================
// 🔥 MAIN COMPONENT
// ========================================================

const SubCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    isActive: true,
    commissionType: "",
    commissionValue: "",
    image: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const subCats = await subCategoryService.getAll();
    const cats = await categoryService.getAll();

    setSubCategories(subCats);
    setCategories(cats);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setSelected(null);
    setFormData({
      categoryId: "",
      name: "",
      isActive: true,
      commissionType: "",
      commissionValue: "",
      image: null,
    });

    setPreviewImage(null);
    setImageFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelected(item);
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      isActive: item.isActive,
      commissionType: item.commissionType ?? "",
      commissionValue: item.commissionValue ?? "",
      image: item.image,
    });

    setPreviewImage(item.image);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      categoryId: formData.categoryId,
      name: formData.name,
      isActive: formData.isActive,
      commissionType: formData.commissionType || null,
      commissionValue: formData.commissionValue
        ? parseFloat(formData.commissionValue)
        : null,
      image: formData.image,
    };

    try {
      if (selected) {
        const updated = await subCategoryService.update(
          selected.id,
          submitData,
          imageFile
        );
        setSubCategories((prev) =>
          prev.map((sc) => (sc.id === selected.id ? updated : sc))
        );
      } else {
        const created = await subCategoryService.add(submitData, imageFile);
        setSubCategories((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error saving subcategory");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete subcategory?")) return;

    await subCategoryService.delete(id);
    setSubCategories((prev) => prev.filter((sc) => sc.id !== id));
  };

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return subCategories.filter(
      (item) =>
        item.name.toLowerCase().includes(t) ||
        item.categoryId.toLowerCase().includes(t)
    );
  }, [subCategories, searchTerm]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Subcategory Management</h2>

        <div className="flex space-x-3">
          <button
            onClick={openAddModal}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Subcategory</span>
          </button>

          <button
            onClick={loadData}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 bg-gray-700 rounded-lg"
            placeholder="Search subcategory..."
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-lg p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="py-2">Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Commission</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-700 hover:bg-gray-700"
                >
                  <td className="py-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-12 h-12 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <Camera size={28} className="text-gray-500" />
                    )}
                  </td>

                  <td>{item.name}</td>

                  <td>
                    {
                      categories.find((c) => c.id === item.categoryId)?.name ||
                      "Unknown"
                    }
                  </td>

                  <td>{item.isActive ? "Active" : "Inactive"}</td>

                  <td>
                    {item.commissionType
                      ? `${item.commissionValue}${item.commissionType === "percent" ? "%" : " ₹"}`
                      : "—"}
                  </td>

                  <td className="text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-red-400">
                {selected ? "Edit Subcategory" : "Add Subcategory"}
              </h3>

              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Category Dropdown */}
              <label className="block mb-2 text-gray-300">Select Category</label>
              <select
                className="w-full bg-gray-700 mb-4 p-2 rounded-lg"
                value={formData.categoryId}
                required
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* NAME */}
              <label className="block mb-2 text-gray-300">Name</label>
              <input
                className="w-full bg-gray-700 mb-4 p-2 rounded-lg"
                value={formData.name}
                required
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              {/* ACTIVE TOGGLE */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Active Status</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, isActive: !p.isActive }))
                  }
                >
                  {formData.isActive ? (
                    <ToggleRight size={32} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* COMMISSION TYPE */}
              <label className="block mb-2 text-gray-300">
                Commission Type (Optional)
              </label>
              <select
                className="w-full bg-gray-700 mb-4 p-2 rounded-lg"
                value={formData.commissionType}
                onChange={(e) =>
                  setFormData({ ...formData, commissionType: e.target.value })
                }
              >
                <option value="">None</option>
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed Amount</option>
              </select>

              {/* COMMISSION VALUE */}
              {formData.commissionType !== "" && (
                <div className="mb-4">
                  <label className="block mb-2 text-gray-300">
                    Commission Value
                  </label>

                  <input
                    type="number"
                    className="w-full bg-gray-700 p-2 rounded-lg"
                    value={formData.commissionValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionValue: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* IMAGE UPLOAD */}
              <label className="block mb-2 text-gray-300">Image</label>

              <div className="flex items-center justify-center">
                <label className="h-28 w-28 bg-gray-700 flex items-center justify-center rounded-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewImage ? (
                    <img
                      src={previewImage}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Camera size={32} className="text-gray-400" />
                  )}
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-600 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
                >
                  {loading
                    ? "Saving..."
                    : selected
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategory;
