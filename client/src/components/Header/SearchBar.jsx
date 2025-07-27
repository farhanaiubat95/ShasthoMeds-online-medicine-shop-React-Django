import { styled, alpha } from "@mui/material/styles";
import { InputBase } from "@mui/material";
import { Search } from "@mui/icons-material";

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

const SearchBar = () => {
  return (
    <div>
      <SearchBox sx={{height:{xs:"35px",sm:"40px", md:"40px", lg:"45px"}}}>
        <SearchIconWrapper>
          <Search />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search all products…"
          inputProps={{ "aria-label": "search" }}
        />
      </SearchBox>
    </div>
  );
};

export default SearchBar;
