import React, { useEffect, useState } from "react"; // <-- add useState
import { Box, Button, Typography, styled } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Header/Navbar";
import { fetchCart, removeFromCart, addToCart } from "../redux/cartSlice";

// ... your styled components stay the same ...

// ================== Main Component ==================
const Cart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.carts);
  const token = localStorage.getItem("access_token");

  // ✅ quantities state
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (token) dispatch(fetchCart(token));
  }, [dispatch, token]);

  // ✅ initialize quantities when cart loads
  useEffect(() => {
    const initialQuantities = {};
    cartState.items.forEach((item) => {
      initialQuantities[item.id] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cartState.items]);

  const handleRemove = (cartItemId) => {
    if (!token) return;
    dispatch(removeFromCart({ cartItemId, token }));
  };

  const handleQuantityChange = (itemId, change, stock) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      let newQty = current + change;
      if (newQty < 1) newQty = 1; // min 1
      if (stock && newQty > stock) newQty = stock; // max stock
      return { ...prev, [itemId]: newQty };
    });
  };

  const totalItems = cartState.items.length;
  const totalNewPrice = cartState.items.reduce(
    (acc, item) => acc + item.product.new_price * item.quantity,
    0
  );

  const totalPrice = cartState.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalDiscount = cartState.items.reduce((acc, item) => {
    if (item.product.discount_price) {
      return acc + item.product.discount_price * item.quantity;
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
                      Tk {item.product.new_price}
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
                          {item.product.offer_price}% off
                        </Box>
                      </>
                    )}
                  </Typography>

                  <QuantityBox>
                    <QuantityButton
                      onClick={() =>
                        handleQuantityChange(item.id, -1, item.product.stock)
                      }
                    >
                      -
                    </QuantityButton>
                    <Typography>
                      {quantities[item.id] || item.quantity}
                    </Typography>
                    <QuantityButton
                      onClick={() =>
                        handleQuantityChange(item.id, +1, item.product.stock)
                      }
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
