// Giả định file db.ts của bạn có cấu trúc tương tự như sau:

export type Recurrence = {
  frequency: "daily" | "weekly" | "monthly";
  interval: number; // e.g. every 1 week, every 2 weeks
  endDate?: string; // ISO date string for recurrence end
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done" | "overdue";
  priority: "low" | "medium" | "high";
  category: "study" | "work" | "personal";
  recurrence?: Recurrence;
};

const LOCAL_STORAGE_KEY = "myTasks"; // Khóa để lưu trữ trong LocalStorage

// Hàm để tải tasks từ LocalStorage
function loadTasksFromLocalStorage(): Task[] {
  try {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
  } catch (error) {
    console.error("Failed to load tasks from LocalStorage:", error);
  }
  // Dữ liệu mặc định nếu không có gì trong LocalStorage hoặc lỗi
  return [
    
  ];
}

// Hàm để lưu tasks vào LocalStorage
function saveTasksToLocalStorage(currentTasks: Task[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentTasks));
  } catch (error) {
    console.error("Failed to save tasks to LocalStorage:", error);
  }
}

let tasks: Task[] = loadTasksFromLocalStorage(); // Khởi tạo tasks từ LocalStorage

export async function getAllTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...tasks]);
    }, 100);
  });
}

export async function createTask(newTask: Omit<Task, "id">): Promise<Task> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const taskWithId = { ...newTask, id: Date.now().toString() };
      tasks.push(taskWithId);
      saveTasksToLocalStorage(tasks); // Lưu vào LocalStorage sau khi thêm
      resolve(taskWithId);
    }, 100);
  });
}

/**
 * Create recurring tasks based on recurrence pattern.
 * Generates tasks from the next occurrence after start dueDate until recurrence.endDate or a max limit.
 */
export async function createRecurringTasks(
  baseTask: Omit<Task, "id" | "dueDate" | "recurrence"> & { dueDate: string; recurrence: Recurrence }
): Promise<Task[]> {
  const createdTasks: Task[] = [];
  const maxOccurrences = 100; // safety limit
  let currentDate = new Date(baseTask.dueDate);
  const endDate = baseTask.recurrence.endDate ? new Date(baseTask.recurrence.endDate) : null;

  for (let i = 0; i < maxOccurrences; i++) {
    // Increment to next occurrence first (skip the base date to avoid duplicates)
    switch (baseTask.recurrence.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + baseTask.recurrence.interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7 * baseTask.recurrence.interval);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + baseTask.recurrence.interval);
        break;
      default:
        throw new Error("Unsupported recurrence frequency");
    }

    if (endDate && currentDate > endDate) break;

    const taskToCreate = {
      ...baseTask,
      dueDate: currentDate.toISOString(),
      recurrence: undefined, // recurrence only on base task
    };

    // Create task and add to list
    // eslint-disable-next-line no-await-in-loop
    const created = await createTask(taskToCreate);
    createdTasks.push(created);
  }

  saveTasksToLocalStorage(tasks);
  return createdTasks;
}

export async function updateTask(updatedTask: Task): Promise<Task> {
  return new Promise((resolve) => {
    setTimeout(() => {
      tasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      saveTasksToLocalStorage(tasks); // Lưu vào LocalStorage sau khi cập nhật
      resolve(updatedTask);
    }, 100);
  });
}

export async function deleteTask(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      saveTasksToLocalStorage(tasks); // Lưu vào LocalStorage sau khi xóa
      resolve();
    }, 100);
  });
}
