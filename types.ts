
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED'
}

export enum Role {
  PROJECT_MANAGER = 'Project Manager',
  FOREMAN = 'Foreman',
  SCREEDER = 'Screeder',
  MIXER = 'Mixer',
  LABOURER = 'Labourer',
  LOGISTICS = 'Logistics'
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  status: 'active' | 'on-leave' | 'off-site';
  joinedDate: string;
}

export interface Task {
  id: string;
  title: string;
  zone: string;
  area: number; // in sqm
  status: TaskStatus;
  assignedTo: string[];
  dueDate: string;
  progress: number;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minimumRequired: number;
  usagePerSqm: number;
}

export interface SiteUpdate {
  timestamp: string;
  author: string;
  content: string;
}
