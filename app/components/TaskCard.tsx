"use client";

import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isOverlay?: boolean;
}

/**
 * TaskCard component represents a single task in a column.
 * It implements @dnd-kit's useSortable for drag efficiency.
 */
export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isOverlay,
}: TaskCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (
    event?: React.MouseEvent | React.KeyboardEvent | object,
  ) => {
    if (event && "stopPropagation" in event) {
      (event as React.MouseEvent).stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose(event);
    onEdit(task);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose(event);
    onDelete(task);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: task });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    marginBottom: "12px",
  };

  return (
    <Card
      ref={setNodeRef}
      style={isOverlay ? undefined : style}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      elevation={isOverlay ? 8 : 2}
      sx={{
        position: "relative",
        transition: "all 0.2s ease",
        borderRadius: 3,
        "&:hover": {
          elevation: 4,
          transform: isOverlay ? "none" : "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="subtitle1" component="div" fontWeight="bold">
              {task.title}
            </Typography>
          </Box>

          {!isOverlay && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                onPointerDown={(e) => e.stopPropagation()}
                sx={{ ml: 1, mt: -0.5 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem onClick={handleEdit}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor:
              task.priority === "high"
                ? "#FEE2E2"
                : task.priority === "medium"
                  ? "#FFEDD5"
                  : "#F1F5F9",
            color:
              task.priority === "high"
                ? "#EF4444"
                : task.priority === "medium"
                  ? "#F59E0B"
                  : "#64748B",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              textTransform: "capitalize",
              fontSize: "0.75rem",
            }}
          >
            {task.priority || "medium"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
