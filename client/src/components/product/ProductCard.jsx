import React from "react";
import image1 from "../../assets/images/napa.jpg";
import image2 from "../../assets/images/alatrol.webp";
import image3 from "../../assets/images/vitaminc.jpeg";

// Sample Product List
const products = [
  {
    id: 1,
    title: "Napa | 500 mg | Tablet | নাপা ৫০০ মি.গ্রা. ট্যাবলেট | Beximco Pharmaceuticals Ltd. | Indications",
    price: "200",
    availability: "In Stock",
    image: image1
  },
  {
    id: 2,
    title: "Alatrol Paediatric Drops 2.5mg/ml Pediatric Drops - Arogga Online Pharmacy",
    price: "100",
    availability: "In Stock",
    image: image2
  },
  {
    id: 3,
    title: "500mg Vitamin C Chewable Tablets at best price in Hyderabad by Aditya Pharmacy",
    price: "120",
    availability: "In Stock",
    image: image3
  },
];

const ProductCard = () => {
  return (
    <div className="border border-[#30C2C0] rounded-xl p-4 mt-4 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col"
          >
            <img
              src={product.image}
              alt={product.title}
              className="h-32 w-full object-contain mb-3"
            />
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">
              {product.title}
            </h3>
            <p className="text-gray-700 mb-1">TK {product.price}</p>
            <p className="text-green-600 text-sm mb-2">
              Availability: {product.availability}
            </p>
            <button className="mt-auto px-4 py-2 cursor-pointer bg-[#30C2C0] text-white rounded hover:bg-[#0F918F]">
              Add To Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
