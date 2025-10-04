import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { InputBase, Box, List, ListItem, ListItemButton, ListItemText, Paper } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SearchBox = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "5px",
  border: "2px solid #30C2C0",
  marginLeft: 0,
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  color: "#0F918F",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  width: "100%",
  paddingTop: "5px",
}));

const SearchBar = ({ products, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (onSearch) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.generic_name &&
            p.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
      onSearch(filtered);
    }
  }, [searchTerm, products, onSearch]);

  const handleClick = (productId) => {
    navigate(`/productdetails/${productId}`);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <SearchBox sx={{ height: { xs: "35px", sm: "40px", md: "40px", lg: "45px" } }}>
        <SearchIconWrapper>
          <Search />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search by product name or generic name…"
          inputProps={{ "aria-label": "search" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBox>

      {/* Dropdown list of filtered products */}
      {searchTerm && filteredProducts.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: 300,
            overflowY: "auto",
            mt: 0.5,
          }}
        >
          <List>
            {filteredProducts.map((p) => (
              <ListItem key={p.id} disablePadding>
                <ListItemButton onClick={() => handleClick(p.id)}>
                  <ListItemText
                    primary={p.name}
                    secondary={p.generic_name ? `(${p.generic_name})` : null}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
