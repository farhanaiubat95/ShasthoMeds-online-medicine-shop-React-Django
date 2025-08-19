import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";
import Slider from "react-slick";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "slick-carousel/slick/slick.css"; // Ensure these are imported
import "slick-carousel/slick/slick-theme.css";

// Styled Arrows...
const PrevArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "-16.2px",
  transform: "translate(0, -50%)",
  backgroundColor: "#ffffff",
  zIndex: 10,
  width: 43,
  height: 80,
  boxShadow: theme.shadows[3],
}));

const NextArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  right: "-17px",
  transform: "translate(0, -50%)",
  backgroundColor: "#ffffff",
  zIndex: 10,
  width: 43,
  height: 80,
  boxShadow: theme.shadows[3],
}));

const PrevArrow = (props) => (
  <PrevArrowButton onClick={props.onClick} size="small">
    <ArrowBackIosNewIcon fontSize="small" />
  </PrevArrowButton>
);

const NextArrow = (props) => (
  <NextArrowButton onClick={props.onClick} size="small">
    <ArrowForwardIosIcon fontSize="small" />
  </NextArrowButton>
);

const ProductCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get products from Redux
  const { products, loading, error } = useSelector((state) => state.products);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!products || products.length === 0) return <p>No products available</p>;

  return (
    <div
      className="border border-[#30C2C0] rounded-xl p-4 mt-4 pb-10 bg-white"
      style={{ width: "100%", position: "relative" }} // Ensure container has width and context for arrows
    >
      <Slider {...sliderSettings}>
        {products.map((product) => (
          <div key={product.id} className="p-2" style={{ width: "auto" }}>
            <Card className="rounded-xl shadow-md flex flex-col" style={{ width: "100%" }}>
              <CardMedia
                component="img"
                image={product.image1 || "/placeholder-image.jpg"} // Fallback for missing image
                alt={product.name || product.title}
                className="h-40 object-contain p-3"
              />
              <CardContent className="flex flex-col flex-grow">
                <Typography
                  variant="subtitle2"
                  className="line-clamp-2 font-semibold mb-1 h-[40px]"
                >
                  {product.name || product.title}
                </Typography>
                <Typography
                  sx={{
                    color: "#30C2C0",
                    fontWeight: "semibold",
                    fontSize: "20px",
                  }}
                >
                  TK {product.price}
                </Typography>
                <Typography
                  variant="body2"
                  color="success.main"
                  className="my-2"
                >
                  Availability:{" "}
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/productdetails/${product.id}`)}
                    sx={{
                      backgroundColor: "#626F47",
                      "&:hover": { backgroundColor: "#A4B465" },
                    }}
                  >
                    View details
                  </Button>
                  <Button
                    variant="contained"
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