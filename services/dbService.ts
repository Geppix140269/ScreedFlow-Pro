
import { Project, Task, TeamMember, Material } from '../types';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM, MOCK_MATERIALS } from '../constants';

const SCHEMA_VERSION = '4.0'; 
const STORAGE_KEYS = {
  PROJECTS: 'screedflow_projects_v4',
  TASKS: 'screedflow_tasks_v4',
  TEAM: 'screedflow_team_v4',
  MATERIALS: 'screedflow_materials_v4',
  VERSION: 'screedflow_schema_version'
};

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  initialize: async () => {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (currentVersion !== SCHEMA_VERSION) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(MOCK_TASKS));
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(MOCK_TEAM));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(MOCK_MATERIALS));
      localStorage.setItem(STORAGE_KEYS.VERSION, SCHEMA_VERSION);
    }
    await delay(50);
  },

  getProjects: async (): Promise<Project[]> => { await delay(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]'); },
  saveProject: async (project: Project): Promise<void> => {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
    const index = projects.findIndex((p: any) => p.id === project.id);
    if (index !== -1) projects[index] = project;
    else projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getTasks: async (): Promise<Task[]> => { await delay(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'); },
  updateTask: async (task: Task): Promise<void> => {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
    const index = tasks.findIndex((t: any) => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  },

  getTeam: async (): Promise<TeamMember[]> => { await delay(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAM) || '[]'); },
  saveMember: async (member: TeamMember): Promise<void> => {
    const team = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAM) || '[]');
    const index = team.findIndex((m: any) => m.id === member.id);
    if (index !== -1) team[index] = member;
    else team.push(member);
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
  },

  getMaterials: async (): Promise<Material[]> => { await delay(); return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]'); }
};
