import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { Task, CreateTaskInput, UpdateTaskInput, TaskColumn } from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/tasks";

/**
 * Interface for json-server v1 pagination response
 */
export interface JsonServerResponse<T> {
  data: T[];
  first?: number;
  prev?: number | null;
  next?: number | null;
  last?: number;
  pages?: number;
  items?: number;
}

/**
 * Interface for the flattened infinite page data
 */
export interface InfinitePage {
  data: Task[];
  next: number | null;
}

/**
 * Hook to fetch tasks with optional filtering and search
 */
export const useTasks = (column?: TaskColumn, search?: string) => {
  return useQuery({
    queryKey: ["tasks", column, search],
    queryFn: async () => {
      const { data } = await axios.get<Task[] | JsonServerResponse<Task>>(
        API_URL,
        {
          params: {
            column: column || undefined,
            // q: search || undefined, // json-server v1 'q' is unreliable
          },
        },
      );

      const tasks = Array.isArray(data) ? data : data.data || [];

      // Manual filtering for search if provided
      if (search) {
        const lowerSearch = search.toLowerCase();
        return tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(lowerSearch) ||
            t.description.toLowerCase().includes(lowerSearch),
        );
      }

      return tasks;
    },
  });
};

/**
 * Infinite scroll hook for each column
 * Handles json-server v1 pagination (_page, _per_page)
 */
export const useTasksInfinite = (column: TaskColumn, search?: string) => {
  return useInfiniteQuery<InfinitePage>({
    queryKey: ["tasks", "infinite", column, search],
    queryFn: async ({ pageParam = 1 }) => {
      // If searching, we fetch all relevant column tasks and paginate locally
      // because json-server v1 'q' doesn't support substring matches well with pagination.
      if (search) {
        const { data } = await axios.get<Task[] | JsonServerResponse<Task>>(
          API_URL,
          {
            params: { column },
          },
        );

        const allColumnTasks = Array.isArray(data) ? data : data.data || [];
        const lowerSearch = search.toLowerCase();
        const filtered = allColumnTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(lowerSearch) ||
            t.description.toLowerCase().includes(lowerSearch),
        );

        const perPage = 10;
        const start = ((pageParam as number) - 1) * perPage;
        const pageTasks = filtered.slice(start, start + perPage);

        return {
          data: pageTasks,
          next:
            start + perPage < filtered.length
              ? (pageParam as number) + 1
              : null,
        };
      }

      // Normal infinite scroll logic using API pagination
      const { data } = await axios.get<Task[] | JsonServerResponse<Task>>(
        API_URL,
        {
          params: {
            column,
            _page: pageParam,
            _per_page: 10,
          },
        },
      );

      if (Array.isArray(data)) {
        return {
          data,
          next: data.length === 10 ? (pageParam as number) + 1 : null,
        };
      }
      return {
        data: data.data || [],
        next: data.next ?? null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next || undefined,
  });
};

/**
 * Hook to create a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: CreateTaskInput) => axios.post(API_URL, newTask),
    onSuccess: () => {
      // Invalidate all task-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

/**
 * Hook to update an existing task (e.g., changing its column or title)
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskInput }) =>
      axios.patch(`${API_URL}/${id}`, updates),
    onSuccess: () => {
      // Small delay can help json-server catch up in some environments
      // but usually invalidation is enough. We invalidate everything under 'tasks'.
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${API_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
