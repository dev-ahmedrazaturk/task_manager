import { Task } from "./task.model";
import { User } from "./user.model";

export interface Comment {
    id: number;
    task: Task;
    user: User;
    text: string;
    created_at: string;
    updated_at: string;
  }