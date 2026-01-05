
import { TeamMember, Role, Task, TaskStatus, Material, ProjectBaselines } from './types';

export const PROJECT_BASELINES: ProjectBaselines = {
  totalBudget: 450000,
  materialBudget: 280000,
  labourBudget: 120000,
  contingency: 50000,
  startDate: '2024-01-01',
  endDate: '2024-08-30',
  targetDailySqm: 150
};

export const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Alex Thompson', role: Role.PROJECT_MANAGER, avatar: 'https://picsum.photos/seed/alex/100', status: 'active', joinedDate: '2023-01-15', email: 'alex@screedflow.pro', phone: '+44 7700 900123', accessLevel: 'Admin' },
  { id: '2', name: 'Marcus Chen', role: Role.FOREMAN, avatar: 'https://picsum.photos/seed/marcus/100', status: 'active', joinedDate: '2023-02-10', email: 'marcus@screedflow.pro', phone: '+44 7700 900456', accessLevel: 'Editor' },
  { id: '3', name: 'Sarah Miller', role: Role.LOGISTICS, avatar: 'https://picsum.photos/seed/sarah/100', status: 'active', joinedDate: '2023-03-01', email: 'sarah@screedflow.pro', phone: '+44 7700 900789', accessLevel: 'Editor' },
  { id: '4', name: 'Dave Wilson', role: Role.SCREEDER, avatar: 'https://picsum.photos/seed/dave/100', status: 'active', joinedDate: '2023-04-12', email: 'dave@gmail.com', phone: '+44 7700 900111', accessLevel: 'Viewer' },
  { id: '5', name: 'Elena Rodriguez', role: Role.SCREEDER, avatar: 'https://picsum.photos/seed/elena/100', status: 'active', joinedDate: '2023-05-01', email: 'elena@gmail.com', phone: '+44 7700 900222', accessLevel: 'Viewer' },
];

export const MOCK_TASKS: Task[] = [
  { 
    id: 't1', 
    title: 'East Wing - Level 1', 
    zone: 'Block A', 
    area: 1200, 
    status: TaskStatus.IN_PROGRESS, 
    assignedTo: ['4', '5'], 
    startDate: '2024-03-01',
    endDate: '2024-03-25',
    progress: 65,
    subTasks: [
      { id: 's1', title: 'Surface Preparation', progress: 100, status: TaskStatus.COMPLETED },
      { id: 's2', title: 'Edge Insulation', progress: 100, status: TaskStatus.COMPLETED },
      { id: 's3', title: 'Main Screed Pour', progress: 40, status: TaskStatus.IN_PROGRESS },
      { id: 's4', title: 'Power Float Finish', progress: 0, status: TaskStatus.PENDING }
    ]
  },
  { 
    id: 't2', 
    title: 'Lobby & Reception', 
    zone: 'Block A', 
    area: 450, 
    status: TaskStatus.COMPLETED, 
    assignedTo: ['4'], 
    startDate: '2024-02-01',
    endDate: '2024-02-15',
    progress: 100,
    subTasks: [
      { id: 's5', title: 'DPM Installation', progress: 100, status: TaskStatus.COMPLETED },
      { id: 's6', title: 'Screed Deployment', progress: 100, status: TaskStatus.COMPLETED }
    ]
  },
  { 
    id: 't3', 
    title: 'Parking Area P1', 
    zone: 'Block B', 
    area: 3500, 
    status: TaskStatus.PENDING, 
    assignedTo: ['3'], 
    startDate: '2024-05-01',
    endDate: '2024-06-15',
    progress: 0,
    subTasks: [
      { id: 's7', title: 'Initial Cleaning', progress: 0, status: TaskStatus.PENDING }
    ]
  },
  { 
    id: 't4', 
    title: 'West Wing - Level 2', 
    zone: 'Block A', 
    area: 1100, 
    status: TaskStatus.DELAYED, 
    assignedTo: ['5'], 
    startDate: '2024-03-05',
    endDate: '2024-03-20',
    progress: 15,
    subTasks: [
      { id: 's8', title: 'Reinforcement Mesh', progress: 30, status: TaskStatus.DELAYED },
      { id: 's9', title: 'Bounding Agent', progress: 0, status: TaskStatus.PENDING }
    ]
  },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'Portland Cement (CEM I)', unit: 'Bags', stock: 1200, minimumRequired: 200, usagePerSqm: 0.25, unitCost: 12.50 },
  { id: 'm2', name: 'Sharp Sand', unit: 'Tonnes', stock: 45, minimumRequired: 10, usagePerSqm: 0.08, unitCost: 65.00 },
  { id: 'm3', name: 'Fibre Reinforcement', unit: 'Kg', stock: 250, minimumRequired: 50, usagePerSqm: 0.1, unitCost: 18.00 },
  { id: 'm4', name: 'SBR Bonding Agent', unit: 'Litres', stock: 500, minimumRequired: 100, usagePerSqm: 0.2, unitCost: 8.40 },
];
