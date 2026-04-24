import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { useLocation } from "react-router-dom";

const Collection = () => {
  const { products, search, showSearch, categories } = useContext(ShopContext);
  const location = useLocation();
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortType, setSortType] = useState('relevant');

  // Derived cascading options from selected filters
  const activeCatObj = categories.find(c => c.name === selectedCategory)
  const subCategoryOptions = activeCatObj ? activeCatObj.subCategories : []
  const activeSubObj = subCategoryOptions.find(s => s.name === selectedSubCategory)
  const typeOptions = activeSubObj ? activeSubObj.subSubCategories : []

  // Pre-apply filter if navigated from navbar category click
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category)
      setSelectedSubCategory(location.state.subCategory || '')
      setSelectedType('')
    }
  }, [location.state])

  // Reset downstream selections when parent changes
  const handleCategoryChange = (val) => {
    setSelectedCategory(prev => prev === val ? '' : val)
    setSelectedSubCategory('')
    setSelectedType('')
  }

  const handleSubCategoryChange = (val) => {
    setSelectedSubCategory(prev => prev === val ? '' : val)
    setSelectedType('')
  }

  const handleTypeChange = (val) => {
    setSelectedType(prev => prev === val ? '' : val)
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory) {
      productsCopy = productsCopy.filter(item => item.category === selectedCategory);
    }
    if (selectedSubCategory) {
      productsCopy = productsCopy.filter(item => item.subCategory === selectedSubCategory);
    }
    if (selectedType) {
      productsCopy = productsCopy.filter(item => item.subSubCategory === selectedType);
    }
    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedType('');
  };

  useEffect(() => { applyFilter(); }, [selectedCategory, selectedSubCategory, selectedType, search, showSearch, products]);
  useEffect(() => { sortProduct(); }, [sortType]);

  return (
    <div className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="Dropdown"
          />
        </p>
        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {categories.map(cat => (
              <label key={cat._id} className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  checked={selectedCategory === cat.name}
                  onChange={() => handleCategoryChange(cat.name)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Sub Category Filter — only shown when a category is selected */}
        {selectedCategory && subCategoryOptions.length > 0 && (
          <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
            <p className="mb-3 text-sm font-medium">SUB CATEGORY</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {subCategoryOptions.map(sub => (
                <label key={sub._id} className="flex gap-2 cursor-pointer">
                  <input
                    className="w-3"
                    type="checkbox"
                    checked={selectedSubCategory === sub.name}
                    onChange={() => handleSubCategoryChange(sub.name)}
                  />
                  {sub.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Type Filter — only shown when a sub category is selected */}
        {selectedSubCategory && typeOptions.length > 0 && (
          <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {typeOptions.map((type, i) => (
                <label key={i} className="flex gap-2 cursor-pointer">
                  <input
                    className="w-3"
                    type="checkbox"
                    checked={selectedType === type}
                    onChange={() => handleTypeChange(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <button
          className={`px-4 py-2 mt-1 text-white bg-black rounded hover:bg-gray-900 ${showFilter ? 'block' : 'hidden'} sm:block`}
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* View Product Items */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300"
          >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/* Map Products */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
