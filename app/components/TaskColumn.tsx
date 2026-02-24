"use client";

import { Box, Typography, CircularProgress, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, TaskColumn as ITaskColumn } from "../types";
import TaskCard from "./TaskCard";
import { useTasksInfinite, InfinitePage } from "../hooks/useTasks";
import { useTaskStore } from "../stores/useTaskStore";
import { useEffect, useRef } from "react";

interface TaskColumnProps {
  id: ITaskColumn;
  title: string;
  color: string;
  backColor: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: (column: ITaskColumn) => void;
}

/**
 * TaskColumn component manages a single Kanban column (e.g., Backlog).
 * It features infinite scrolling using React Query's fetchNextPage.
 */
export default function TaskColumn({
  id,
  title,
  color,
  backColor,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: TaskColumnProps) {
  const { searchQuery } = useTaskStore();
  const observerTarget = useRef<HTMLDivElement>(null);

  // useTasksInfinite handles the paginated data fetching logic
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useTasksInfinite(id, searchQuery);

  const { setNodeRef } = useDroppable({ id });

  /**
   * Deduplicate tasks by ID to prevent "unique key" warnings.
   * This is important when fresh pages might contain tasks that were just moved locally.
   */
  const allTasks =
    data?.pages.flatMap((page: InfinitePage) =>
      Array.isArray(page.data) ? page.data : [],
    ) || [];
  const tasks = Array.from(
    new Map(
      allTasks
        .filter((t: Task): t is Task => !!t && !!t.id)
        .map((t: Task) => [String(t.id), t]),
    ).values(),
  );

  /**
   * Setup IntersectionObserver for infinite scrolling.
   * When the user scrolls to the bottom of the list, we fetch the next page.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 300,
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#F1F5F9",
        borderRadius: 4,
        p: 2,
        boxShadow: "none", // Remove inner shadow for cleaner look
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: color,
              border: `2px solid ${backColor}`,
              boxShadow: `0 0 0 2px ${color}20`,
            }}
          />

          <Typography variant="subtitle1" color="text.primary">
            <span style={{ fontWeight: 800, fontSize: "16px" }}>
              {title.toUpperCase()}
            </span>

            <span
              style={{
                fontWeight: 500,
                fontSize: "14px",
                marginLeft: "8px",
                opacity: 0.7,
              }}
            >
              {tasks.length}
            </span>
          </Typography>
        </Box>
      </Box>

      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 3,
          },
        }}
      >
        {status === "pending" ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              border: "2px dashed #cbd5e1",
              borderRadius: 3,
              opacity: 0.6,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No tasks here
            </Typography>
          </Box>
        ) : (
          <SortableContext
            items={tasks.map((t) => String(t.id))}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={`task-${task.id}`}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>
        )}

        <div ref={observerTarget} style={{ height: 20 }}>
          {isFetchingNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </div>

        {/* Reorganized Add Task Button */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Button
            fullWidth
            variant="text"
            startIcon={<AddIcon />}
            onClick={() => onAddTask(id)}
            sx={{
              justifyContent: "flex-start",
              color: "text.secondary",
              fontWeight: "600",
              border: "1px solid #cbd5e1",
              borderRadius: 2,
              py: 1.5,
              px: 2,
              "&:hover": {
                backgroundColor: "white",
                color: "primary.main",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            Add Task
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
