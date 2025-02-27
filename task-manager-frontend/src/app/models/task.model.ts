import { Project } from "./project.model";
import { User } from "./user.model";
import { Comment } from "./comment.model";

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  project: Project;
  assigned_to: User[];
  comments: Comment[] | null;
  count: number
}