"use client";

import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { Task, TaskColumn, TaskPriority } from "../types";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultColumn?: TaskColumn;
}

/**
 * TaskModal is a shared dialog for creating new tasks or editing existing ones.
 * It uses Material UI Dialog and common form inputs.
 */
export default function TaskModal({
  open,
  onClose,
  task,
  defaultColumn = "backlog",
}: TaskModalProps) {
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [column, setColumn] = useState<TaskColumn>(
    task?.column || defaultColumn,
  );
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium",
  );

  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });

  const validate = () => {
    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (task) {
      updateTask({
        id: task.id,
        updates: { title, description, column, priority },
      });
    } else {
      createTask({ title, description, column, priority });
    }
    onClose();
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            required
            error={errors.title}
            helperText={errors.title ? "Title is required" : ""}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            required
            error={errors.description}
            helperText={errors.description ? "Description is required" : ""}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth disabled={isPending}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={isPending}>
              <InputLabel>Column</InputLabel>
              <Select
                value={column}
                label="Column"
                onChange={(e) => setColumn(e.target.value as TaskColumn)}
              >
                <MenuItem value="backlog">Backlog</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isPending}
        >
          {task ? "Update Task" : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
