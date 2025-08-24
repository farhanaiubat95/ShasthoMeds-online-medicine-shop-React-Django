import React, { useEffect } from "react";
import { Box, Button, Typography, styled } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Header/Navbar";
import { fetchCart, removeFromCart, addToCart } from "../redux/cartSlice";

// ================= Styled Components =================
const Component = styled(Box)(({ theme }) => ({
  width: "80%",
  margin: "0px auto",
  padding: "90px 0",
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  [theme.breakpoints.down("md")]: { width: "90%", flexDirection: "column" },
}));

const ContainerLeft = styled(Box)(({ theme }) => ({
  flex: "0 0 60%",
  background: "#fff",
  border: "1px solid #f0f0f0",
  boxShadow: "rgba(15, 145, 143, 100) 0px 1px 5px 0px",
  [theme.breakpoints.down("md")]: { flex: "1 1 auto", marginBottom: "15px" },
}));

const ContainerRight = styled(Box)(({ theme }) => ({
  flex: "0 0 40%",
  background: "#fff",
  border: "1px solid #f0f0f0",
  boxShadow: "rgba(15, 145, 143, 100) 0px 1px 5px 0px",
}));

const Header = styled(Box)(() => ({ padding: "15px 24px" }));
const ButtonWrapper = styled(Box)(() => ({
  padding: "15px 24px",
  boxShadow: "0 -2px 10px 0 rgb(0 0 0 / 10%)",
  borderTop: "1px solid #f0f0f0",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginLeft: "auto",
  color: "#fff",
  background: "#0F918F",
  width: "250px",
  height: "50px",
  "&:hover": { background: "#30C2C0" },
  [theme.breakpoints.down("md")]: { width: "230px", height: "40px" },
  [theme.breakpoints.down("sm")]: { width: "130px" },
}));

const Heading = styled(Box)(({ theme }) => ({
  padding: "15px 24px",
  background: "#fff",
  borderBottom: "1px solid #f2f2f2",
  "& > p": {
    color: "#878787",
    fontSize: "16px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
}));

const Container = styled(Box)(({ theme }) => ({
  padding: "15px 24px",
  background: "#fff",
  "& > p": {
    color: "#878787",
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  "& > h6": {
    paddingTop: "20px",
    marginBottom: "20px",
    borderTop: "1px solid #f2f2f2",
  },
}));

const DiscountBoxs = styled(Box)(({ theme }) => ({
  color: "green",
  fontWeight: 500,
  fontSize: "14px",
}));

const CartItemBox = styled(Box)(({ theme }) => ({
  borderTop: "1px solid #f0f0f0",
  margin: "10px",
  display: "flex",
  justifyContent: "space-between",
  padding: "0 20px ",
}));

const LeftBox = styled(Box)(({ theme }) => ({
  width: "10%",
  margin: "20px 10px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  [theme.breakpoints.down("md")]: { width: "20%" },
}));

const Image = styled("img")(({ theme }) => ({
  width: "120px",
  height: "50px",
  [theme.breakpoints.down("md")]: { width: "70px", height: "80px" },
  [theme.breakpoints.down("sm")]: { width: "60px", height: "70px" },
}));

const RightBox = styled(Box)(({ theme }) => ({
  width: "90%",
  margin: "20px 0px",
  textAlign: "left",
  paddingLeft: "40px",
  [theme.breakpoints.down("md")]: { width: "80%", paddingLeft: "20px" },
  [theme.breakpoints.down("sm")]: { paddingLeft: "15px" },
}));

const RightText = styled(Typography)(({ theme }) => ({
  width: "350px",
  fontSize: "16px",
  color: "#0F918F",
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  [theme.breakpoints.down("lg")]: { width: "300px" },
  [theme.breakpoints.down("md")]: { width: "200px" },
}));

const RemoveButton = styled(Button)(() => ({
  marginTop: "20px",
  fontSize: "14px",
  color: "#000",
  fontWeight: "700",
  padding: 0,
  "&:hover": { backgroundColor: "transparent" },
}));

const QuantityBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "10px",
}));

const QuantityButton = styled(Button)(() => ({
  minWidth: "25px",
  padding: "5px",
  fontWeight: 700,
  border: "1px solid #0F918F",
  color: "#0F918F",
  "&:hover": { background: "#0F918F", color: "#fff" },
}));

// ================== Main Component ==================
const Cart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.carts);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) dispatch(fetchCart(token));
  }, [dispatch, token]);

  const handleRemove = (cartItemId) => {
    if (!token) return;
    dispatch(removeFromCart({ cartItemId, token }));
  };

  const handleQuantityChange = (item, change) => {
    if (!token) return;

    const newQuantity = item.quantity + change;

    // Prevent quantity less than 1
    if (newQuantity < 1) return;

    // Prevent quantity more than available stock
    if (item.product.stock && newQuantity > item.product.stock) return;

    dispatch(
      addToCart({
        product_id: item.product.id,
        quantity: 1, // send 1 for increment/decrement, backend should handle update
        token,
        update: true, // optional flag if your backend differentiates between add & update
        cartItemId: item.id, // send cartItemId if backend requires it for update
        change, // send +1 or -1 if backend uses it
      }),
    );
  };

  const totalItems = cartState.items.length;
  const totalNewPrice = cartState.items.reduce(
    (acc, item) => acc + item.product.new_price * item.quantity,
    0,
  );

  const totalPrice = cartState.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const totalDiscount = cartState.items.reduce((acc, item) => {
    if (item.product.discount_price) {
      return (
        acc + (item.product.discount_price * item.quantity)
      );
    }
    return acc;
  }, 0);

  const totalAmount = totalNewPrice + 40; // + delivery

  return (
    <div>
      <Navbar Title={`My Cart`} />
      <Component>
        <ContainerLeft>
          <Header>
            <Typography variant="h6" style={{ color: "#0F918F" }}>
              My Cart ({totalItems})
            </Typography>
          </Header>

          <Box className="p-3">
            {cartState.items.map((item) => (
              <CartItemBox key={item.id}>
                <LeftBox>
                  <Image
                    src={item.product.image1 || "/placeholder-image.jpg"}
                    alt={item.product.name}
                  />
                  <Typography>Qty: {item.quantity}</Typography>
                </LeftBox>

                <RightBox>
                  <RightText>{item.product.name}</RightText>
                  <Typography>
                    <Box component="span" style={{ color: "#878787" }}>
                      Seller: {item.product.brand?.name || "Unknown"}
                    </Box>
                  </Typography>

                  <Typography style={{ marginTop: 10 }}>
                    <Box
                      component="span"
                      style={{ fontSize: 17, fontWeight: 600 }}
                    >
                      Tk {item.product.new_price} X {item.quantity}
                    </Box>
                    {item.product.offer_price && (
                      <>
                        <Box
                          component="span"
                          style={{ margin: "0 15px", color: "#878787" }}
                        >
                          <strike>Tk {item.product.price}</strike>
                        </Box>
                        <Box component="span" style={{ color: "#388E3C" }}>
                          {item.product.offer_price}
                          % off
                        </Box>
                      </>
                    )}
                  </Typography>

                  <QuantityBox>
                    <QuantityButton
                      onClick={() => handleQuantityChange(item, -1)}
                    >
                      -
                    </QuantityButton>
                    <Typography>{item.quantity}</Typography>
                    <QuantityButton
                      onClick={() => handleQuantityChange(item, +1)}
                    >
                      +
                    </QuantityButton>
                  </QuantityBox>

                  <RemoveButton onClick={() => handleRemove(item.id)}>
                    Remove
                  </RemoveButton>
                </RightBox>
              </CartItemBox>
            ))}
          </Box>

          <ButtonWrapper className="flex">
            <StyledButton>Place Order</StyledButton>
          </ButtonWrapper>
        </ContainerLeft>

        <ContainerRight>
          <Box>
            <Heading>
              <Typography variant="h6" color="#0F918F">
                Price Details
              </Typography>
            </Heading>
            <Container>
              <Typography>
                Regular Price ({totalItems} items)
                <Box component="span" sx={{ float: "right" }}>
                  Tk {totalPrice.toFixed(2)}
                </Box>
              </Typography>
              <Typography>
                Offer Price
                <Box component="span" sx={{ float: "right" }}>
                  Tk {totalNewPrice.toFixed(2)}
                </Box>
              </Typography>
              <Typography>
                Delivery Charges
                <Box component="span" sx={{ float: "right" }}>
                  Tk 40
                </Box>
              </Typography>
              <Typography variant="h6" color="#0F918F">
                Total Amount
                <Box component="span" sx={{ float: "right" }}>
                  Tk {totalAmount.toFixed(2)}
                </Box>
              </Typography>

              <DiscountBoxs>
                You will save Tk {totalDiscount.toFixed(2)} on this order
              </DiscountBoxs>
            </Container>
          </Box>
        </ContainerRight>
      </Component>
    </div>
  );
};

export default Cart;
