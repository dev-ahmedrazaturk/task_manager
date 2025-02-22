import { User } from "./user.model";

export interface Project {
    id: number;
    name: string;
    description: string;
    created_by: User;
    created_at: string;
    assigned_users: User[];
  }
  