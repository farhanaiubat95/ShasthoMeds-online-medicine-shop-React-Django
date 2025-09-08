import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "../../redux/brandSlice"; // make sure brandSlice exists
import Slider from "react-slick";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IconButton from "@mui/material/IconButton";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Reuse styled arrows
const PrevArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "-16.2px",
  transform: "translate(0, -50%)",
  backgroundColor: "#ffffff",
  zIndex: 10,
  width: 43,
  height: 80,
  borderRadius: "0 8px 8px 0",
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
  borderRadius: "8px 0 0 8px",
  boxShadow: theme.shadows[3],
}));
const PrevArrow = (props) => (
  <PrevArrowButton onClick={props.onClick}>
    <ArrowBackIosNewIcon fontSize="small" />
  </PrevArrowButton>
);
const NextArrow = (props) => (
  <NextArrowButton onClick={props.onClick}>
    <ArrowForwardIosIcon fontSize="small" />
  </NextArrowButton>
);

const SlideBrand = () => {
  const dispatch = useDispatch();

  // Redux state
  const { items, loading, error } = useSelector((state) => state.brands || {});
  const brands = Array.isArray(items?.results) ? items.results : [];
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    dispatch(fetchBrands(token));
  }, [dispatch, token]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 960, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };


  const displayBrands = brands.length > 0 ? brands : [];

  if (loading) return <p>Loading brands...</p>;
  if (error) return <p>Error loading brands: {error}</p>;

  return (
    <div className="border border-[#30C2C0] rounded-xl p-4 mt-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 ml-3 text-[#30C2C0]">
        Popular Brands
      </h2>
      <Slider {...settings}>
        {displayBrands.map((brand) => (
          <div key={brand.id} className="p-2">
            <Card className="rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition">
              <CardMedia
                component="img"
                image={brand.image || "/placeholder-brand.jpg"}
                alt={brand.name}
                className="h-24 w-24 object-contain mx-auto"
              />

              <CardContent className="p-1">
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{
                    maxWidth: 80, // fixed width in px (adjust as needed)
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  className="text-center font-medium"
                >
                  {brand.name}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlideBrand;
