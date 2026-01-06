
import { TeamMember, Role, Task, TaskStatus, Material, Project, Crew, MaterialCategory } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Harbour Square',
    location: 'Bristol, UK',
    type: 'Residential',
    status: 'active',
    foremanId: '2',
    baselines: {
      totalBudget: 450000,
      plannedM2: 15000,
      targetDailyM2: 200,
      startDate: '2024-03-01',
      endDate: '2024-08-30'
    },
    floorPlans: [
      { id: 'f1', name: 'Ground Floor Plan', url: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800', uploadedAt: '2024-03-01' }
    ]
  },
  {
    id: 'p2',
    name: 'City Tower Phase II',
    location: 'London, UK',
    type: 'Commercial',
    status: 'active',
    foremanId: '3',
    baselines: {
      totalBudget: 890000,
      plannedM2: 35000,
      targetDailyM2: 350,
      startDate: '2024-04-15',
      endDate: '2024-12-20'
    }
  }
];

export const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Marie Wood', role: Role.PROJECT_MANAGER, avatar: 'https://picsum.photos/seed/marie/100', status: 'active', joinedDate: '2023-01-15', email: 'marie@screedworks.co.uk', phone: '+44 7700 900123', accessLevel: 'Admin' },
  { id: '2', name: 'Marcus Chen', role: Role.FOREMAN, avatar: 'https://picsum.photos/seed/marcus/100', status: 'active', joinedDate: '2023-02-10', email: 'marcus@screedflow.pro', phone: '+44 7700 900456', accessLevel: 'Editor', assignedProjectId: 'p1' },
  { id: '3', name: 'Sarah Miller', role: Role.FOREMAN, avatar: 'https://picsum.photos/seed/sarah/100', status: 'active', joinedDate: '2023-03-01', email: 'sarah@screedflow.pro', phone: '+44 7700 900789', accessLevel: 'Editor', assignedProjectId: 'p2' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Main Lobby', zone: 'North', plannedM2: 2000, actualM2: 1250, status: TaskStatus.IN_PROGRESS, startDate: '2024-03-01', endDate: '2024-03-25' },
  { id: 't2', projectId: 'p1', title: 'Apartments A1-A10', zone: 'East', plannedM2: 800, actualM2: 0, status: TaskStatus.PENDING, startDate: '2024-03-26', endDate: '2024-04-10' },
  { id: 't3', projectId: 'p1', title: 'Service Corridors', zone: 'Central', plannedM2: 1500, actualM2: 0, status: TaskStatus.PENDING, startDate: '2024-04-11', endDate: '2024-05-01' },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', locationType: 'Central', category: MaterialCategory.CONSUMABLE, name: 'Screed Binder', unit: 'Tonnes', stock: 450, minimumRequired: 50, usagePerSqm: 0.04, unitCost: 185 },
  { id: 'm2', locationType: 'Central', category: MaterialCategory.PLANT, name: 'Brinkmann SP20 Pump', unit: 'Unit', stock: 4, minimumRequired: 1, usagePerSqm: 0, unitCost: 45000 },
  { id: 'm3', locationType: 'Central', category: MaterialCategory.EQUIPMENT, name: 'Laser Level Kit', unit: 'Set', stock: 12, minimumRequired: 2, usagePerSqm: 0, unitCost: 1200 },
  { id: 'm4', projectId: 'p1', locationType: 'Site', category: MaterialCategory.CONSUMABLE, name: 'SBR Primer', unit: 'Liters', stock: 200, minimumRequired: 20, usagePerSqm: 0.1, unitCost: 4.50 },
];
