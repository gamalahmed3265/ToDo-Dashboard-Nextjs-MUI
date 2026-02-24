"use client";

import { useState } from "react";
import { Box, Container } from "@mui/material";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";

import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Task, TaskColumn as ITaskColumn } from "../types";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import DeleteTaskDialog from "./DeleteTaskDialog";
import { useUpdateTask, useTasks, useDeleteTask } from "../hooks/useTasks";
import { useTaskStore } from "../stores/useTaskStore";

const COLUMNS: {
  id: ITaskColumn;
  title: string;
  color: string;
  backColor: string;
}[] = [
  { id: "backlog", title: "To Do", color: "#3B82F6", backColor: "#eff6ff" },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#F59E0B",
    backColor: "#fffbeb",
  },
  { id: "review", title: "In Review", color: "#8B5CF6", backColor: "#f5f3ff" },
  { id: "done", title: "Done", color: "#10B981", backColor: "#ecfdf5" },
];

/**
 * TaskBoard is the main entry point for the Kanban board.
 * It uses @dnd-kit/core to handle drag-and-drop functionality across multiple columns.
 */
export default function TaskBoard() {
  const { searchQuery } = useTaskStore();
  // Fetch only necessary tasks for the board. Note: individual columns handle their own infinite scroll.
  const { data: allTasks = [] } = useTasks(undefined, searchQuery);
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<ITaskColumn>("backlog");

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Configure sensors for interaction (Pointer for mouse/touch, Keyboard for accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid triggering drag on small movements or clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Called when a drag operation starts.
   * We store the active task to display it in the DragOverlay.
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTask(active.data.current as Task);
  };

  const handleDragOver = () => {
    // Optional: Implement real-time sorting between columns if using sortable strategy across columns.
  };

  /**
   * Called when a drag operation ends.
   * This is where we trigger the backend update to move the task between columns.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = active.data.current as Task;

    // SCENARIO 1: Dropped over a column (id is in COLUMNS)
    if (COLUMNS.find((c) => c.id === overId)) {
      if (activeTaskData.column !== overId) {
        updateTask({
          id: activeId,
          updates: { column: overId as ITaskColumn },
        });
      }
    }
    // SCENARIO 2: Dropped over another task (id is a task id)
    else {
      const overTask = allTasks.find((t) => t.id === overId);
      if (overTask && activeTaskData.column !== overTask.column) {
        // Move task to the target task's column
        updateTask({ id: activeId, updates: { column: overTask.column } });
      }
    }

    setActiveTask(null);
  };

  /**
   * Opens the modal for editing a task.
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  /**
   * Opens the delete confirmation dialog.
   */
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Triggers the actual deletion from the backend.
   */
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  /**
   * Opens the modal for adding a new task to a specific column.
   */
  const handleAddTask = (column: ITaskColumn) => {
    setTargetColumn(column);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            pb: 4,
            minHeight: "70vh",
            alignItems: "flex-start",
          }}
        >
          {COLUMNS.map((col) => (
            <TaskColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              backColor={col.backColor}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          ))}
        </Box>

        {/* DragOverlay shows the actual TaskCard moving around while dragging */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              isOverlay
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Shared modal for Create and Update actions */}
      <TaskModal
        key={editingTask?.id || (isModalOpen ? "new" : "closed")}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        defaultColumn={targetColumn}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ""}
      />
    </Container>
  );
}
