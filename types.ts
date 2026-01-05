
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

export interface SubTask {
  id: string;
  title: string;
  progress: number;
  status: TaskStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  status: 'active' | 'on-leave' | 'off-site';
  joinedDate: string;
  email: string;
  phone: string;
  accessLevel: 'Admin' | 'Editor' | 'Viewer';
}

export interface Task {
  id: string;
  title: string;
  zone: string;
  area: number; // in sqm
  status: TaskStatus;
  assignedTo: string[];
  startDate: string;
  endDate: string;
  progress: number;
  subTasks: SubTask[];
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minimumRequired: number;
  usagePerSqm: number;
  unitCost: number; 
}

export interface ProjectBaselines {
  totalBudget: number;
  materialBudget: number;
  labourBudget: number;
  contingency: number;
  startDate: string;
  endDate: string;
  targetDailySqm: number;
}

export interface Notification {
  id: string;
  type: 'assignment' | 'material' | 'alert' | 'update' | 'financial';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
