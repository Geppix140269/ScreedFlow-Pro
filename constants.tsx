
import { TeamMember, Role, Task, TaskStatus, Material } from './types';

export const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Alex Thompson', role: Role.PROJECT_MANAGER, avatar: 'https://picsum.photos/seed/alex/100', status: 'active', joinedDate: '2023-01-15' },
  { id: '2', name: 'Marcus Chen', role: Role.FOREMAN, avatar: 'https://picsum.photos/seed/marcus/100', status: 'active', joinedDate: '2023-02-10' },
  { id: '3', name: 'Sarah Miller', role: Role.LOGISTICS, avatar: 'https://picsum.photos/seed/sarah/100', status: 'active', joinedDate: '2023-03-01' },
  { id: '4', name: 'Dave Wilson', role: Role.SCREEDER, avatar: 'https://picsum.photos/seed/dave/100', status: 'active', joinedDate: '2023-04-12' },
  { id: '5', name: 'Elena Rodriguez', role: Role.SCREEDER, avatar: 'https://picsum.photos/seed/elena/100', status: 'active', joinedDate: '2023-05-01' },
  { id: '6', name: 'John Doe', role: Role.MIXER, avatar: 'https://picsum.photos/seed/john/100', status: 'active', joinedDate: '2023-06-15' },
  { id: '7', name: 'Sam Brown', role: Role.LABOURER, avatar: 'https://picsum.photos/seed/sam/100', status: 'off-site', joinedDate: '2023-07-01' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'East Wing - Level 1', zone: 'Block A', area: 1200, status: TaskStatus.IN_PROGRESS, assignedTo: ['4', '5'], dueDate: '2023-11-20', progress: 65 },
  { id: 't2', title: 'Lobby & Reception', zone: 'Block A', area: 450, status: TaskStatus.COMPLETED, assignedTo: ['4'], dueDate: '2023-11-10', progress: 100 },
  { id: 't3', title: 'Parking Area P1', zone: 'Block B', area: 3500, status: TaskStatus.PENDING, assignedTo: ['6', '7'], dueDate: '2023-12-01', progress: 0 },
  { id: 't4', title: 'West Wing - Level 2', zone: 'Block A', area: 1100, status: TaskStatus.DELAYED, assignedTo: ['5'], dueDate: '2023-11-15', progress: 15 },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'Portland Cement (CEM I)', unit: 'Bags', stock: 1200, minimumRequired: 200, usagePerSqm: 0.25 },
  { id: 'm2', name: 'Sharp Sand', unit: 'Tonnes', stock: 45, minimumRequired: 10, usagePerSqm: 0.08 },
  { id: 'm3', name: 'Fibre Reinforcement', unit: 'Kg', stock: 250, minimumRequired: 50, usagePerSqm: 0.1 },
  { id: 'm4', name: 'SBR Bonding Agent', unit: 'Litres', stock: 500, minimumRequired: 100, usagePerSqm: 0.2 },
  { id: 'm5', name: 'Water', unit: 'm3', stock: 10, minimumRequired: 2, usagePerSqm: 0.02 },
];
