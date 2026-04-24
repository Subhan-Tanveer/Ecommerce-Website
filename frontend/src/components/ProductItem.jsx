import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link className="text-gray-700 cursor-pointer group" to={`/product/${id}`}>
      <div className="overflow-hidden rounded-lg bg-gray-50 aspect-[3/4]">
        <img
          className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          src={image[0]}
          alt={name}
        />
      </div>
      <p className="pt-3 pb-1 text-sm truncate">{name}</p>
      <p className="text-sm font-semibold text-gray-800">
        {currency}&nbsp;
        {price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </Link>
  );
};

export default ProductItem;
