"use client";

import { TextField, InputAdornment, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTaskStore } from "../stores/useTaskStore";

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useTaskStore();

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <TextField
        size="small" // 👈 ده المهم
        variant="outlined"
        placeholder="Search tasks by title or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          maxWidth: 600,
          backgroundColor: "#f8fafc",
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
