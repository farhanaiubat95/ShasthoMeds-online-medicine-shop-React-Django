import React from "react";
import { Box, Button, Typography, styled } from "@mui/material";
import Navbar from "../components/Header/Navbar";
// ================= Styled Components =================

const Component = styled(Box)(({ theme }) => ({
  width: "70%",
  margin: "0px auto",
  padding: "90px 0",
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  [theme.breakpoints.down("md")]: {
    width: "90%",
    flexDirection: "column",
  },
}));

const ContainerLeft = styled(Box)(({ theme }) => ({
  flex: "0 0 60%",
  background: "#fff",
  border: "1px solid #f0f0f0",
  boxShadow: "rgba(15, 145, 143, 100) 0px 1px 5px 0px",
  [theme.breakpoints.down("md")]: {
    flex: "1 1 auto",
    marginBottom: "15px",
  },
}));

const ContainerRight = styled(Box)(({ theme }) => ({
  flex: "0 0 40%",
  background: "#fff",
  border: "1px solid #f0f0f0",
  boxShadow: "rgba(15, 145, 143, 100) 0px 1px 5px 0px",
}));

const Header = styled(Box)(() => ({
  padding: "15px 24px",
}));

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
  "&:hover": {
    background: "#30C2C0",
  },
  [theme.breakpoints.down("md")]: {
    width: "230px",
    height: "40px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "130px",
  },
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
  [theme.breakpoints.down("md")]: {
    width: "20%",
  },
}));

const Image = styled("img")(({ theme }) => ({
  width: "80px",
  height: "90px",
  [theme.breakpoints.down("md")]: {
    width: "70px",
    height: "80px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "60px",
    height: "70px",
  },
}));

const RightBox = styled(Box)(({ theme }) => ({
  width: "90%",
  margin: "20px 0px",
  textAlign: "left",
  paddingLeft: "40px",
  [theme.breakpoints.down("md")]: {
    width: "80%",
    paddingLeft: "20px",
  },
  [theme.breakpoints.down("sm")]: {
    paddingLeft: "15px",
  },
}));

const RightText = styled(Typography)(({ theme }) => ({
  width: "350px",
  fontSize: "16px",
  color: "#0F918F",
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  [theme.breakpoints.down("lg")]: {
    width: "300px",
  },
  [theme.breakpoints.down("md")]: {
    width: "200px",
  },
}));

const RemoveButton = styled(Button)(() => ({
  marginTop: "20px",
  fontSize: "14px",
  color: "#000",
  fontWeight: "700",
  padding: 0,
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

const QtyComponent = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  margin: "10px 0",
}));

const StyledButtonGroup = styled(Box)(() => ({
  display: "flex",
  gap: "5px",
}));

const CircleButton = styled(Button)(({ theme }) => ({
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  minWidth: "22px",
  padding: 0,
  color: "#000",
  borderColor: "#000",
  fontWeight: "bold",
}));

const MiddleButton = styled(Button)(({ theme }) => ({
  height: "22px",
  minWidth: "30px",
  padding: "0 10px",
  borderRadius: "5px",
  color: "#000",
  borderColor: "#000",
  fontWeight: "bold",
}));

// ================== Main Component ==================

const Cart = () => {
  return (
    <div>
      <Navbar Title="My Cart" />
      <Component>
        <ContainerLeft>
          <Header>
            <Typography variant="h6" style={{ color: "#0F918F" }}>
              My Cart (2)
            </Typography>
          </Header>

          <Box className="p-3">
            {[1, 2].map((_, index) => (
              <CartItemBox key={index}>
                <LeftBox>
                  <Image
                    src="https://via.placeholder.com/80x90"
                    alt="Product"
                  />
                  <QtyComponent>
                    <StyledButtonGroup>
                      <CircleButton variant="outlined">-</CircleButton>
                      <MiddleButton variant="outlined">1</MiddleButton>
                      <CircleButton variant="outlined">+</CircleButton>
                    </StyledButtonGroup>
                  </QtyComponent>
                </LeftBox>

                <RightBox>
                  <RightText>Sample Product Title</RightText>
                  <Typography>
                    <Box component="span" style={{ color: "#878787" }}>
                      Seller: Demo Shop
                    </Box>
                  </Typography>

                  <Typography style={{ marginTop: 10 }}>
                    <Box
                      component="span"
                      style={{ fontSize: 17, fontWeight: 600 }}
                    >
                      Tk 999
                    </Box>
                    <Box
                      component="span"
                      style={{ margin: "0 15px", color: "#878787" }}
                    >
                      <strike>Tk 1299</strike>
                    </Box>
                    <Box component="span" style={{ color: "#388E3C" }}>
                      23% off
                    </Box>
                  </Typography>

                  <RemoveButton>Remove</RemoveButton>
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
                Price (2 items)
                <Box component="span" sx={{ float: "right" }}>
                  Tk 1998
                </Box>
              </Typography>

              <Typography>
                Discount
                <Box component="span" sx={{ float: "right" }}>
                  -Tk 300
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
                  Tk 1738
                </Box>
              </Typography>

              <DiscountBoxs>
                <Typography>You will save Tk 260 on this order</Typography>
              </DiscountBoxs>
            </Container>
          </Box>
        </ContainerRight>
      </Component>
    </div>
  );
};

export default Cart;
