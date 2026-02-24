"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

/**
 * DeleteTaskDialog is a confirmation modal to prevent accidental task deletions.
 */
export default function DeleteTaskDialog({
  open,
  onClose,
  onConfirm,
  taskTitle,
}: DeleteTaskDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-dialog-title">
      <DialogTitle id="delete-dialog-title">Delete Task?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete &quot;<strong>{taskTitle}</strong>
          &quot;? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          color="error"
          variant="contained"
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
