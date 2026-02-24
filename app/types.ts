export type TaskColumn = "backlog" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  column: TaskColumn;
  priority: TaskPriority;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  column: TaskColumn;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  column?: TaskColumn;
  priority?: TaskPriority;
}
