"use client";

import { useSyncExternalStore } from "react";

import { Box, Typography, Container, AppBar, Toolbar } from "@mui/material";
import TaskBoard from "./components/TaskBoard";
import SearchBar from "./components/SearchBar";
import GridViewIcon from "@mui/icons-material/GridView";
import { useTasks } from "./hooks/useTasks";

/**
 * Hook to check if the component is rendered on the client.
 * Uses useSyncExternalStore to avoid 'setState in useEffect' lint issues.
 */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Home page of the Kanban ToDo application.
 * It manages the main layout and hydration mounting logic.
 */
export default function Home() {
  const isClient = useIsClient();
  const { data: tasks = [] } = useTasks();

  // Return a simple loader or empty box during SSR to prevent hydration issues
  if (!isClient) {
    return <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }} />;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#F1F5F9",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.main",
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <GridViewIcon />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="h5"
                    noWrap
                    component="div"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "-0.5px",
                      color: "text.primary",
                    }}
                  >
                    KANBAN BOARD
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "gray",
                    }}
                  >
                    {`${tasks.length} Total`}
                  </Typography>
                </Box>
              </Box>
              <SearchBar />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pt: 6, bgcolor: "#f8fafc" }}>
        <Container maxWidth="xl">
          <TaskBoard />
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Premium ToDo Dashboard &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}
