import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import image1 from "../../assets/images/napa.jpg";
import image2 from "../../assets/images/alatrol.webp";
import image3 from "../../assets/images/vitaminc.jpeg";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import navigation

// Styled PrevArrow using MUI styled
const PrevArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "-16.2px", // adjust left position as needed
  transform: "translate(0, -50%)",
  backgroundColor: "#ffffff",
  color: "black",
  borderLeft: "1px solid #30C2C0",
  borderRadius: "0 10px 10px 0",
  "&:hover": {
    border: "1px solid #30C2C0",
  },
  zIndex: 10,
  width: 43,
  height: 80,
  boxShadow: theme.shadows[3],
}));

const NextArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  right: "-17px", // adjust right position as needed
  transform: "translate(0, -50%)",
  backgroundColor: "#ffffff",
  color: "black",
  borderRadius: "10px 0px 0px 10px",
  borderRight: "1px solid #30C2C0",
  "&:hover": {
    border: "1px solid #30C2C0",
  },
  zIndex: 10,
  width: 43,
  height: 80,
  boxShadow: theme.shadows[3],
}));

// Custom PrevArrow component for react-slick
const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <PrevArrowButton onClick={onClick} aria-label="Previous" size="small">
      <ArrowBackIosNewIcon fontSize="small" />
    </PrevArrowButton>
  );
};

// Custom NextArrow component for react-slick
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <NextArrowButton onClick={onClick} aria-label="Next" size="small">
      <ArrowForwardIosIcon fontSize="small" />
    </NextArrowButton>
  );
};

const products = [
  {
    id: 1,
    title:
      "Napa | 500 mg | Tablet | নাপা ৫০০ মি.গ্রা. ট্যাবলেট | Beximco Pharmaceuticals Ltd. | Indications",
    price: "200",
    availability: "In Stock",
    image: image1,
  },
  {
    id: 2,
    title:
      "Alatrol Paediatric Drops 2.5mg/ml Pediatric Drops - Arogga Online Pharmacy",
    price: "100",
    availability: "In Stock",
    image: image2,
  },
  {
    id: 3,
    title:
      "500mg Vitamin C Chewable Tablets at best price in Hyderabad by Aditya Pharmacy",
    price: "120",
    availability: "In Stock",
    image: image3,
  },
  {
    id: 4,
    title:
      "500mg Vitamin C Chewable Tablets at best price in Hyderabad by Aditya Pharmacy",
    price: "120",
    availability: "In Stock",
    image: image3,
  },
  {
    id: 5,
    title:
      "500mg Vitamin C Chewable Tablets at best price in Hyderabad by Aditya Pharmacy",
    price: "120",
    availability: "In Stock",
    image: image3,
  },
];

const ProductCard = () => {
  const navigate = useNavigate(); // Create navigate function

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="border border-[#30C2C0] rounded-xl p-4 mt-4 pb-10 bg-white overflow-visible">
      <Slider {...sliderSettings}>
        {products.map((product) => (
          <div key={product.id} className="p-2 overflow-hidden">
            <Card className="rounded-xl shadow-md h-full flex flex-col">
              <CardMedia
                component="img"
                image={product.image}
                alt={product.title}
                className="h-40 object-contain p-3"
              />
              <CardContent className="flex flex-col flex-grow overflow-hidden">
                <Typography
                  variant="subtitle2"
                  className="line-clamp-2 font-semibold mb-1 h-[40px]"
                >
                  {product.title}
                </Typography>
                <div className="mt-2">
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#30C2C0",
                      fontWeight: "semibold",
                      fontSize: "20px",
                    }}
                  >
                    TK {product.price}
                  </Typography>
                </div>
                <div className="my-2">
                  <Typography variant="body2" color="success.main">
                    Availability: {product.availability}
                  </Typography>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    className="!text-xs lg:!text-[10px]"
                    sx={{
                      backgroundColor: "#626F47",
                      "&:hover": { backgroundColor: "#A4B465" },
                    }}
                    onClick={() => navigate("/productdetails")} // Navigation
                  >
                    View details
                  </Button>

                  <Button
                    variant="contained"
                    className="!text-xs  lg:!text-[10px]"
                    sx={{
                      backgroundColor: "#CA7842",
                      "&:hover": { backgroundColor: "#FF9B45" },
                    }}
                  >
                    Add To Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCard;
