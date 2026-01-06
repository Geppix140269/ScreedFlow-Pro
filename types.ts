
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
  LOGISTICS = 'Logistics',
  CLIENT = 'Client'
}

export enum MaterialCategory {
  CONSUMABLE = 'Consumable',
  PLANT = 'Plant/Machinery',
  EQUIPMENT = 'Equipment'
}

export interface Crew {
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
}

export interface FloorPlan {
  id: string;
  name: string;
  url: string; // base64 or URL
  uploadedAt: string;
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
  accessLevel: 'Admin' | 'Editor' | 'Viewer' | 'Client';
  assignedProjectId?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  zone: string;
  plannedM2: number; 
  actualM2: number;
  status: TaskStatus;
  assignedCrewId?: string;
  startDate: string;
  endDate: string;
}

export interface Material {
  id: string;
  projectId?: string; 
  locationType: 'Central' | 'Site';
  category: MaterialCategory;
  name: string;
  unit: string;
  stock: number;
  minimumRequired: number;
  usagePerSqm: number;
  unitCost: number; 
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: 'Residential' | 'Commercial' | 'Industrial';
  baselines: {
    totalBudget: number;
    plannedM2: number;
    targetDailyM2: number;
    startDate: string;
    endDate: string;
  };
  foremanId: string;
  status: 'active' | 'bidding' | 'completed';
  floorPlans?: FloorPlan[];
}
