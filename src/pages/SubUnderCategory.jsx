import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  X,
  Camera,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

import {
  db,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "../../firebase";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const SubUnderCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [subUnderCategories, setSubUnderCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSubUnderCategory, setSelectedSubUnderCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // form
  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    name: "",
    image: "",
    isActive: true,
    sortOrder: 0,
    commissionType: "percent",
    commissionValue: 0,
  });

  // ----------------------
  // LOAD FIRESTORE DATA
  // ----------------------
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const catSnap = await getDocs(collection(db, "categories"));
      const subCatSnap = await getDocs(collection(db, "subcategories"));
      const subUnderSnap = await getDocs(collection(db, "subunder"));

      setCategories(
        catSnap.docs.map((d) => ({
          id: d.id,
          data: d.data(),
        }))
      );

      setSubCategories(
        subCatSnap.docs.map((d) => ({
          id: d.id,
          data: d.data(),
        }))
      );

      setSubUnderCategories(
        subUnderSnap.docs.map((d) => ({
          id: d.id,
          data: d.data(),
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // FORM INPUT CHANGES
  // ----------------------
  const handleInput = (e) => {
    const { name, value } = e.target;

    // When selecting category → clear sub category
    if (name === "categoryId") {
      setFormData((prev) => ({
        ...prev,
        categoryId: value,
        subCategoryId: "",
        name: "",
      }));
      return;
    }

    // When selecting subcategory ⇒ auto-generate name
    if (name === "subCategoryId") {
      const cat = categories.find((c) => c.id === formData.categoryId);
      const subcat = subCategories.find((s) => s.id === value);

      const generated =
        cat && subcat ? `${cat.data.name} ${subcat.data.name} Under Category` : "";

      setFormData((prev) => ({
        ...prev,
        subCategoryId: value,
        name: generated,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sortOrder" || name === "commissionValue"
          ? Number(value)
          : value,
    }));
  };

  // ----------------------
  // IMAGE HANDLING
  // ----------------------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    const fileName = `subunder_${Date.now()}_${imageFile.name}`;
    const storageRef = ref(storage, `sub_under_categories/${fileName}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  // ----------------------
  // SUBMIT FORM
  // ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = await uploadImage();

      const payload = {
        ...formData,
        image: url,
      };

      if (selectedSubUnderCategory) {
        await updateDoc(doc(db, "subunder", selectedSubUnderCategory.id), payload);
      } else {
        await addDoc(collection(db, "subunder"), payload);
      }

      handleCancel();
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // EDIT / DELETE
  // ----------------------
  const handleEdit = (item) => {
    setSelectedSubUnderCategory(item);

    setFormData({
      ...item.data,
    });

    setPreviewImage(item.data.image);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    await deleteDoc(doc(db, "subunder", id));
    setSubUnderCategories((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCancel = () => {
    setSelectedSubUnderCategory(null);
    setFormData({
      categoryId: "",
      subCategoryId: "",
      name: "",
      image: "",
      isActive: true,
      sortOrder: 0,
      commissionType: "percent",
      commissionValue: 0,
    });

    setPreviewImage(null);
    setImageFile(null);
    setIsModalOpen(false);
  };

  // ----------------------
  // SEARCH
  // ----------------------
  const list = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return subUnderCategories.filter((i) =>
      i.data.name.toLowerCase().includes(t)
    );
  }, [searchTerm, subUnderCategories]);

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Sub Under Category</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
          <button onClick={fetchAll} className="bg-gray-700 p-2 rounded-lg">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-gray-800 p-4 mb-6 rounded-lg flex items-center">
        <Search className="text-gray-400" />
        <input
          className="bg-gray-800 ml-3 outline-none text-white w-full"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Sort</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-b border-gray-700">
                <td className="px-4 py-3">{i.data.name}</td>
                <td className="px-4 py-3">
                  {i.data.isActive ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3">{i.data.sortOrder}</td>

                <td className="px-4 py-3 text-right flex justify-end gap-4">
                  <button onClick={() => handleEdit(i)} className="text-blue-400">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(i.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------------- */}
      {/* MODAL */}
      {/* ---------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">
                {selectedSubUnderCategory ? "Edit" : "Add"} Sub Under Category
              </h3>
              <button onClick={handleCancel}><X /></button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* IMAGE */}
              <div className="mb-4">
                <label className="block mb-2">Image *</label>
                <div className="relative h-28 bg-gray-700 rounded-lg flex justify-center items-center cursor-pointer">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  {previewImage ? (
                    <>
                      <img
                        src={previewImage}
                        className="h-full w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <Camera size={30} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* CATEGORY */}
              <div className="mb-4">
                <label>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInput}
                  className="w-full bg-gray-700 p-2 rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.data.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUB CATEGORY */}
              <div className="mb-4">
                <label>Sub Category *</label>
                <select
                  name="subCategoryId"
                  disabled={!formData.categoryId}
                  value={formData.subCategoryId}
                  onChange={handleInput}
                  className="w-full bg-gray-700 p-2 rounded"
                  required
                >
                  <option value="">Select Sub Category</option>

                  {subCategories
                    .filter((sc) => sc.data.categoryId === formData.categoryId)
                    .map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.data.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* NAME */}
              <div className="mb-4">
                <label>Name *</label>
                <input
                  className="w-full bg-gray-700 p-2 rounded"
                  value={formData.name}
                  onChange={handleInput}
                  name="name"
                  required
                />
              </div>

              {/* ACTIVE */}
              <div className="mb-4 flex items-center justify-between">
                <label>Active Status</label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, isActive: !p.isActive }))
                  }
                >
                  {formData.isActive ? (
                    <ToggleRight size={36} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={36} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* SORT ORDER */}
              <div className="mb-4">
                <label>Sort Order *</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 p-2 rounded"
                  value={formData.sortOrder}
                  name="sortOrder"
                  onChange={handleInput}
                  required
                />
              </div>

              {/* COMMISSION TYPE */}
              <div className="mb-4">
                <label>Commission Type</label>
                <select
                  name="commissionType"
                  className="w-full bg-gray-700 p-2 rounded"
                  value={formData.commissionType}
                  onChange={handleInput}
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              {/* COMMISSION VALUE */}
              <div className="mb-4">
                <label>Commission Value</label>
                <input
                  type="number"
                  name="commissionValue"
                  className="w-full bg-gray-700 p-2 rounded"
                  value={formData.commissionValue}
                  onChange={handleInput}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="w-1/2 bg-gray-600 p-2 rounded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="w-1/2 bg-blue-600 p-2 rounded">
                  {loading ? "Saving..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubUnderCategory;
