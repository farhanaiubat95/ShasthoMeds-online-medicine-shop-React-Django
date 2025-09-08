import React, { useEffect } from "react";
import Slider from "react-slick";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/categorySlice.js"; // adjust path if needed
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Styled arrows
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

const SlideCategory = () => {
  const dispatch = useDispatch();
  const categories = useSelector(
    (state) => state.categories?.items?.results || [],
  );

  console.log("Categories:", categories);

  const token = localStorage.getItem("access_token");

  // Fetch categories when component mounts
  useEffect(() => {
    if (token) {
      dispatch(fetchCategories(token));
    }
  }, [dispatch, token]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 2500,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 960, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };

  const displayCategories =
    categories && categories.length > 0 ? categories : [];

  return (
    <div className="border border-[#30C2C0] rounded-xl p-4 mt-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 ml-3 text-[#30C2C0]">
        Categories
      </h2>
      <Slider {...settings}>
        {displayCategories.map((cat) => (
          <div key={cat.id} className="p-2">
            <Card className="rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition">
              <CardMedia
                component="img"
                image={cat.image || "/placeholder-category.jpg"}
                alt={cat.name}
                className="h-24 w-24 object-contain p-2"
              />
              <CardContent className="p-2">
                <Typography
                  variant="subtitle2"
                  className="text-center font-medium"
                >
                  {cat.name}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlideCategory;
