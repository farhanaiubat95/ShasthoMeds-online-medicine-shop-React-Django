import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeFromCart, addToCart } from "../redux/cartSlice.js";

const Container = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  padding: "20px",
  gap: "20px",
});

const ContainerLeft = styled(Box)({
  flex: 2,
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
});

const ContainerRight = styled(Box)({
  flex: 1,
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  height: "fit-content",
});

const ItemBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "15px",
});

const Image = styled("img")({
  width: "80px",
  height: "80px",
  borderRadius: "8px",
  objectFit: "cover",
  marginRight: "15px",
});

const StyledButton = styled(Button)({
  backgroundColor: "#0F918F",
  color: "#fff",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "20px",
  width: "100%",
  "&:hover": {
    backgroundColor: "#0c7776",
  },
});

const DiscountBoxs = styled(Box)({
  backgroundColor: "#e6f7f7",
  color: "#0F918F",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "20px",
  textAlign: "center",
});

export default function Cart() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const cartState = useSelector((state) => state.carts);
  const [quantities, setQuantities] = useState({});
  const access_token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) {
      dispatch(fetchCart(token)); // correct function
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (cartState.items.length > 0) {
      const initialQuantities = {};
      cartState.items.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [cartState.items]);

  const handleQuantityChange = (itemId, change) => {
    setQuantities((prev) => {
      const updated = { ...prev };
      const newQuantity = (updated[itemId] || 1) + change;
      if (newQuantity > 0) {
        updated[itemId] = newQuantity;
      }
      return updated;
    });
  };

  const handleRemoveItem = async (item_id) => {
    console.log("cart_item_id", item_id);
    console.log("token", access_token);

    const access_token = localStorage.getItem("access_token");

    try{
     const resultAction = await dispatch(
        removeFromCart({
          cart_item_id: item_id,
          token: access_token,
        }),
      );

      if (removeFromCart.fulfilled.match(resultAction)) {
        console.log("Item Removed from cart:", resultAction.payload);
        alert("Item Removed from cart!");
      } else {
        console.error("Failed to remove:", resultAction.payload);
        alert("Failed to remove items from cart!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Oh no, Exception error ! Failed to remove items from cart.");
    }
  };

  if (cartState.loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (cartState.error) {
    return (
      <Box textAlign="center" mt={5} color="red">
        Error: {cartState.error}
      </Box>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography variant="h6">Your cart is empty</Typography>
      </Box>
    );
  }

  // Totals using updated quantities
  const totalItems = cartState.items.reduce(
    (acc, item) => acc + (quantities[item.id] || item.quantity),
    0,
  );

  const tempTotalNewPrice = cartState.items.reduce(
    (acc, item) =>
      acc + item.product.new_price * (quantities[item.id] || item.quantity),
    0,
  );

  const tempTotalPrice = cartState.items.reduce(
    (acc, item) =>
      acc + item.product.price * (quantities[item.id] || item.quantity),
    0,
  );

  const tempTotalDiscount = cartState.items.reduce((acc, item) => {
    if (item.product.discount_price) {
      return (
        acc +
        item.product.discount_price * (quantities[item.id] || item.quantity)
      );
    }
    return acc;
  }, 0);

  const tempTotalAmount = tempTotalNewPrice + 40; // with delivery charge

  return (
    <Container>
      {/* Left side */}
      <ContainerLeft>
        <Typography variant="h6" mb={2}>
          Shopping Cart
        </Typography>
        {cartState.items.map((item) => (
          <ItemBox key={item.id}>
            <Box display="flex" alignItems="center">
              <Image
                src={item.product.image1 || "/placeholder.jpg"}
                alt={item.product.name}
              />
              <Box>
                <Typography variant="subtitle1">{item.product.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Tk {item.product.new_price}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={() => handleQuantityChange(item.id, -1)}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <Typography
                variant="body1"
                mx={1}
                style={{ minWidth: "20px", textAlign: "center" }}
              >
                {quantities[item.id] || item.quantity}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(item.id, 1)}
                size="small"
              >
                <AddIcon />
              </IconButton>
              <IconButton
                onClick={() => handleRemoveItem(item.id)}
                color="error"
              >
                <DeleteIcon /> {item.id}
              </IconButton>
            </Box>
          </ItemBox>
        ))}
      </ContainerLeft>

      {/* Right side */}
      <ContainerRight>
        <Typography variant="h6" mb={2}>
          Price Details
        </Typography>
        <Divider />
        <Typography>
          Regular Price ({totalItems} items)
          <Box component="span" sx={{ float: "right" }}>
            Tk {tempTotalPrice.toFixed(2)}
          </Box>
        </Typography>
        <Typography>
          Offer Price
          <Box component="span" sx={{ float: "right" }}>
            Tk {tempTotalNewPrice.toFixed(2)}
          </Box>
        </Typography>
        <Typography>
          Delivery Charges
          <Box component="span" sx={{ float: "right" }}>
            Tk 40
          </Box>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" color="#0F918F">
          Total Amount
          <Box component="span" sx={{ float: "right" }}>
            Tk {tempTotalAmount.toFixed(2)}
          </Box>
        </Typography>
        <DiscountBoxs>
          You will save Tk {tempTotalDiscount.toFixed(2)} on this order
        </DiscountBoxs>
        <StyledButton
          onClick={() => {
            const orderData = {
              totalPrice: tempTotalPrice,
              totalNewPrice: tempTotalNewPrice,
              totalDiscount: tempTotalDiscount,
              totalAmount: tempTotalAmount,
              quantities,
            };
            console.log("Order data sending:", orderData);
            // dispatch(orderActionHere({ token, orderData }));
          }}
        >
          Place Order
        </StyledButton>
      </ContainerRight>
    </Container>
  );
}
