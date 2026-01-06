
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, ListTodo, Package, Briefcase, Lock, LogOut, Loader2,
  MapPin, CheckCircle2, TrendingUp, ChevronRight, Menu, Users, 
  Target, Activity, Layers, ArrowUpRight, ArrowDownRight, Info, Plus, 
  Eye, FileText, AlertCircle, Camera, Calendar, RefreshCcw, Save, 
  X, ArrowLeftRight, DollarSign, PieChart, ShieldAlert, Settings, HardHat, Clock, 
  Trash2, UserPlus, BoxSelect, Upload, Image as ImageIcon, BarChart2
} from 'lucide-react';
import { MOCK_TEAM, MOCK_TASKS, MOCK_PROJECTS, MOCK_MATERIALS } from './constants';
import { TaskStatus, Role, TeamMember, Task, Project, Material, MaterialCategory, FloorPlan } from './types';
import { dbService } from './services/dbService';

// --- Utility Components ---

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24}/></button>
      </div>
      {children}
    </div>
  </div>
);

// --- Gantt Chart Component ---

const GanttChart = ({ tasks, projectStart, projectEnd }: { tasks: Task[], projectStart: string, projectEnd: string }) => {
  const startDate = new Date(projectStart);
  const endDate = new Date(projectEnd);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = (date.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return (diff / totalDays) * 100;
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex border-b border-slate-100 pb-4 mb-6">
          <div className="w-1/4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Zone / Task</div>
          <div className="flex-1 relative h-6">
            <div className="absolute inset-0 flex justify-between px-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{projectStart}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{projectEnd}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {tasks.map(t => {
            const left = getPosition(t.startDate);
            const right = getPosition(t.endDate);
            const width = Math.max(2, right - left);
            
            return (
              <div key={t.id} className="flex items-center group">
                <div className="w-1/4 pr-4">
                  <p className="text-xs font-black text-slate-800 truncate uppercase">{t.title}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase">{t.zone}</p>
                </div>
                <div className="flex-1 h-8 bg-slate-50 rounded-lg relative overflow-hidden">
                  <div 
                    className={`absolute h-full rounded-lg transition-all border-r-4 border-black/10 flex items-center px-3 ${
                      t.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 
                      t.status === TaskStatus.IN_PROGRESS ? 'bg-indigo-600' : 
                      t.status === TaskStatus.DELAYED ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <span className="text-[8px] font-black text-white uppercase whitespace-nowrap overflow-hidden">{Math.round((t.actualM2/t.plannedM2)*100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [user, setUser] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'project' | 'stock' | 'workforce'>('portfolio');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<'ops' | 'timeline' | 'assets' | 'fin'>('ops');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState<Project | 'new' | null>(null);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<TeamMember | 'new' | null>(null);

  const fetchData = async () => {
    await dbService.initialize();
    const [p, t, tm, m] = await Promise.all([
      dbService.getProjects(), dbService.getTasks(), dbService.getTeam(), dbService.getMaterials()
    ]);
    setProjects(p);
    setTasks(t);
    setTeam(tm);
    setMaterials(m);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('screed_session_v3');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: TeamMember) => {
    setUser(u);
    localStorage.setItem('screed_session_v3', JSON.stringify(u));
  };

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [selectedProjectId, projects]);
  const projectTasks = useMemo(() => tasks.filter(t => t.projectId === selectedProjectId), [selectedProjectId, tasks]);

  // Handlers
  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p: Project = {
      id: typeof showProjectModal === 'object' ? showProjectModal.id : `p-${Date.now()}`,
      name: fd.get('name') as string,
      location: fd.get('location') as string,
      type: fd.get('type') as any,
      status: fd.get('status') as any,
      foremanId: '1',
      baselines: {
        totalBudget: Number(fd.get('budget')),
        plannedM2: Number(fd.get('m2')),
        targetDailyM2: 250,
        startDate: fd.get('start') as string,
        endDate: fd.get('end') as string,
      },
      floorPlans: typeof showProjectModal === 'object' ? showProjectModal.floorPlans : []
    };
    await dbService.saveProject(p);
    setShowProjectModal(null);
    fetchData();
  };

  const handleUploadFloorPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    const fd = new FormData(e.currentTarget);
    const file = (fd.get('file') as File);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const newPlan: FloorPlan = {
        id: `f-${Date.now()}`,
        name: fd.get('name') as string || file.name,
        url: base64,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      const updated = { ...selectedProject, floorPlans: [...(selectedProject.floorPlans || []), newPlan] };
      await dbService.saveProject(updated);
      setShowAssetModal(false);
      fetchData();
    };
    reader.readAsDataURL(file);
  };

  const globalStats = useMemo(() => {
    const totalValue = projects.reduce((a, b) => a + b.baselines.totalBudget, 0);
    const totalM2 = projects.reduce((a, b) => a + b.baselines.plannedM2, 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    return { totalValue, totalM2, activeProjects };
  }, [projects]);

  if (!user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl relative z-10 text-center border border-white/20">
        <div className="bg-indigo-600 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40">
          <HardHat className="text-white" size={38} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">ScreedOps <span className="text-indigo-600">Enterprise</span></h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 mb-12">Professional Site Management v4.0</p>
        <div className="space-y-4">
           <button onClick={() => handleLogin(MOCK_TEAM[0])} className="w-full p-6 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-between group">
             <span>Access as Project Manager</span>
             <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
           </button>
           <button onClick={() => handleLogin(MOCK_TEAM[1])} className="w-full p-6 bg-slate-800 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl flex items-center justify-between group">
             <span>Access as Site Foreman</span>
             <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
           </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-indigo-500" size={48}/></div>;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-80 bg-slate-900 text-slate-400 p-6 lg:p-10 flex flex-col shrink-0 border-r border-slate-800 shadow-2xl z-50">
        <div className="flex items-center gap-4 mb-16">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20"><ShieldAlert className="text-white" size={24} /></div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">ScreedOps</h1>
            <p className="text-[8px] font-black text-indigo-400 uppercase mt-1 tracking-widest">Enterprise OS</p>
          </div>
        </div>
        
        <nav className="space-y-3 flex-1">
           {[
             { id: 'portfolio', icon: LayoutDashboard, label: 'Command Hub' },
             { id: 'workforce', icon: Users, label: 'Personnel' },
             { id: 'stock', icon: BoxSelect, label: 'Global Inventory' }
           ].map(item => (
             <button key={item.id} onClick={() => {setActiveTab(item.id as any); setSelectedProjectId(null);}} className={`w-full flex items-center gap-5 px-5 py-5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
               <item.icon size={22} /><span className="text-[11px] font-black uppercase tracking-widest hidden lg:block">{item.label}</span>
             </button>
           ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800">
           <div className="hidden lg:flex items-center gap-4 mb-8 bg-slate-800/50 p-4 rounded-2xl">
              <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="text-[10px] font-black text-white uppercase truncate">{user.name}</p>
                <p className="text-[8px] font-bold text-indigo-400 uppercase">{user.role}</p>
              </div>
           </div>
           <button onClick={() => { localStorage.removeItem('screed_session_v3'); setUser(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
             <LogOut size={20} /><span className="text-[10px] font-black uppercase hidden lg:block">System Logout</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-14 relative bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
           {/* Tab Specific Content */}
           
           {activeTab === 'portfolio' && (
             <div className="space-y-12 animate-in fade-in duration-700">
               {/* Portfolio Header Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio Value</p>
                    <h3 className="text-3xl font-black italic text-slate-900">£{(globalStats.totalValue / 1000).toFixed(0)}k</h3>
                    <div className="flex items-center gap-2 mt-4 text-emerald-500"><TrendingUp size={14}/><span className="text-[10px] font-black">+12% YoY</span></div>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Poured Surface</p>
                    <h3 className="text-3xl font-black italic text-slate-900">{globalStats.totalM2.toLocaleString()} m²</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Across 8 sites</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Projects</p>
                    <h3 className="text-3xl font-black italic text-slate-900">{globalStats.activeProjects}</h3>
                    <p className="text-[10px] font-bold text-indigo-500 mt-4 uppercase">Ops Normal</p>
                 </div>
                 <button onClick={() => setShowProjectModal('new')} className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-transform flex flex-col justify-center items-center text-center group">
                    <Plus size={32} className="mb-4 group-hover:rotate-90 transition-transform"/>
                    <span className="text-[11px] font-black uppercase tracking-widest">New Enterprise Project</span>
                 </button>
               </div>

               {/* Project List */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map(p => (
                    <div key={p.id} onClick={() => { setSelectedProjectId(p.id); setActiveTab('project'); }} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-indigo-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-[420px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8">
                         <button onClick={(e) => { e.stopPropagation(); setShowProjectModal(p); }} className="text-slate-300 hover:text-indigo-600"><Settings size={20}/></button>
                      </div>
                      <div className="mb-auto">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase mb-6 inline-block ${p.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                         <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                         <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><MapPin size={14}/> {p.location}</p>
                      </div>
                      <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Budget Allocation</p>
                               <p className="text-lg font-black text-slate-900">£{p.baselines.totalBudget.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Target Yield</p>
                               <p className="text-lg font-black text-slate-900">{p.baselines.plannedM2.toLocaleString()} m²</p>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                               <span className="text-slate-400">Completion</span>
                               <span className="text-indigo-600">42%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 w-[42%] rounded-full" />
                            </div>
                         </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {activeTab === 'project' && selectedProject && (
             <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                {/* Project Context Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                   <div>
                      <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-2 flex items-center gap-3">
                         <button onClick={() => { setActiveTab('portfolio'); setSelectedProjectId(null); }} className="hover:text-slate-900"><ArrowLeftRight size={14}/></button>
                         Active Site Protocol
                      </p>
                      <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{selectedProject.name}</h2>
                   </div>
                   <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-[2rem]">
                      {[
                        { id: 'ops', icon: Activity, label: 'Ops' },
                        { id: 'timeline', icon: Calendar, label: 'Timeline' },
                        { id: 'assets', icon: ImageIcon, label: 'Floor Plans' },
                        { id: 'fin', icon: DollarSign, label: 'Financials' }
                      ].map(t => (
                        <button key={t.id} onClick={() => setProjectSubTab(t.id as any)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${projectSubTab === t.id ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}>
                           <t.icon size={14}/> {t.label}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Sub-Tab Content */}
                {projectSubTab === 'ops' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-center mb-10">
                              <h4 className="text-xl font-black uppercase italic text-slate-900">Production Zones</h4>
                              <button className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"><Plus size={16}/> New Zone</button>
                           </div>
                           <div className="space-y-4">
                              {projectTasks.map(t => (
                                <div key={t.id} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-100">
                                   <div className="flex-1">
                                      <p className="text-[10px] font-black text-indigo-500 uppercase mb-1 tracking-widest">{t.zone} SECTOR</p>
                                      <h5 className="text-2xl font-black text-slate-800 italic">{t.title}</h5>
                                   </div>
                                   <div className="flex items-center gap-8">
                                      <div className="text-right">
                                         <p className="text-2xl font-black text-slate-900">{t.actualM2.toLocaleString()} / {t.plannedM2.toLocaleString()} m²</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {t.status}</p>
                                      </div>
                                      <button 
                                         onClick={async () => {
                                           const updated = { ...t, actualM2: t.actualM2 + 100, status: TaskStatus.IN_PROGRESS };
                                           await dbService.updateTask(updated);
                                           fetchData();
                                         }}
                                         className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                                      >
                                         <Plus size={24}/>
                                      </button>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                           <h4 className="text-lg font-black uppercase italic mb-8 flex items-center gap-3 text-indigo-400">Site Team</h4>
                           <div className="space-y-4">
                              {team.filter(m => m.assignedProjectId === selectedProjectId).map(m => (
                                <div key={m.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                   <img src={m.avatar} className="w-10 h-10 rounded-xl object-cover" />
                                   <div>
                                      <p className="text-xs font-black uppercase">{m.name}</p>
                                      <p className="text-[8px] font-black text-indigo-400 uppercase">{m.role}</p>
                                   </div>
                                </div>
                              ))}
                              <button onClick={() => setActiveTab('workforce')} className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"><UserPlus size={14}/> Reassign Crew</button>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {projectSubTab === 'timeline' && (
                  <GanttChart 
                    tasks={projectTasks} 
                    projectStart={selectedProject.baselines.startDate} 
                    projectEnd={selectedProject.baselines.endDate} 
                  />
                )}

                {projectSubTab === 'assets' && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                     <div className="flex justify-between items-center">
                        <h4 className="text-2xl font-black uppercase italic text-slate-900">Blueprint Archive</h4>
                        <button onClick={() => setShowAssetModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all"><Upload size={18}/> Upload floor Plan</button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {selectedProject.floorPlans?.map(fp => (
                           <div key={fp.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                              <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-6 relative">
                                 <img src={fp.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button className="bg-white p-4 rounded-full text-slate-900 shadow-xl"><Eye size={24}/></button>
                                 </div>
                              </div>
                              <h5 className="font-black text-slate-800 uppercase italic tracking-tighter">{fp.name}</h5>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Uploaded: {fp.uploadedAt}</p>
                           </div>
                        ))}
                        {(!selectedProject.floorPlans || selectedProject.floorPlans.length === 0) && (
                          <div className="lg:col-span-3 h-80 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300">
                             <ImageIcon size={48} className="mb-4 opacity-20"/>
                             <p className="text-[10px] font-black uppercase tracking-widest">No site documentation available</p>
                          </div>
                        )}
                     </div>
                  </div>
                )}

                {projectSubTab === 'fin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
                     <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h4 className="text-xl font-black uppercase italic mb-10 text-slate-900">Budget Analytics</h4>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planned Budget</span>
                              <span className="text-2xl font-black text-slate-900">£{selectedProject.baselines.totalBudget.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border-l-4 border-indigo-500">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Burn</span>
                              <span className="text-2xl font-black text-indigo-600">£{(selectedProject.baselines.totalBudget * 0.38).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Variance</span>
                              <span className="text-2xl font-black text-emerald-500">- £12,400</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl">
                        <h4 className="text-xl font-black uppercase italic mb-10 text-indigo-400">Material Forecast</h4>
                        <div className="space-y-8">
                           {materials.filter(m => m.projectId === selectedProjectId || m.locationType === 'Central').slice(0, 3).map(m => (
                             <div key={m.id} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                   <span className="text-slate-400">{m.name}</span>
                                   <span className="text-white">{m.stock} {m.unit}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-indigo-500 w-[65%]" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'stock' && (
             <div className="space-y-12 animate-in fade-in duration-500">
               {/* Categorized Stock */}
               {Object.values(MaterialCategory).map(cat => (
                 <div key={cat} className="space-y-6">
                   <h4 className="text-2xl font-black uppercase italic text-slate-900 flex items-center gap-4">
                     <div className="h-0.5 flex-1 bg-slate-200"/>
                     {cat}
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {materials.filter(m => m.category === cat).map(m => (
                       <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                         <p className="text-[9px] font-black text-indigo-500 uppercase mb-2">{m.locationType}</p>
                         <h5 className="text-xl font-black text-slate-900 mb-6 italic leading-tight">{m.name}</h5>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-3xl font-black text-slate-900">{m.stock}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase">{m.unit}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unit Cost</p>
                               <p className="text-sm font-black text-slate-900">£{m.unitCost}</p>
                            </div>
                         </div>
                       </div>
                     ))}
                     <button className="border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all gap-3 group">
                        <Plus className="group-hover:rotate-90 transition-transform"/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Add {cat}</span>
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {activeTab === 'workforce' && (
             <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {team.map(m => (
                   <div key={m.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative group">
                     <button className="absolute top-8 right-8 text-slate-300 hover:text-indigo-600 transition-colors"><Settings size={18}/></button>
                     <img src={m.avatar} className="w-24 h-24 rounded-[2.2rem] object-cover mb-6 shadow-2xl" />
                     <h4 className="text-xl font-black text-slate-900 mb-1">{m.name}</h4>
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">{m.role}</p>
                     <div className="w-full pt-6 border-t border-slate-50 mt-auto">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Assignment</p>
                        <p className="text-[11px] font-black text-slate-700 uppercase italic truncate">{m.assignedProjectId ? projects.find(p => p.id === m.assignedProjectId)?.name : 'Reserve Pool'}</p>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => setShowMemberModal('new')} className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                    <UserPlus size={48} className="mb-4 text-indigo-400"/>
                    <span className="text-[11px] font-black uppercase tracking-widest">Recruit Personnel</span>
                 </button>
               </div>
             </div>
           )}
        </div>
      </main>

      {/* MODALS */}
      
      {showProjectModal && (
        <Modal title={showProjectModal === 'new' ? 'Initialize Enterprise Project' : 'Project Parameters'} onClose={() => setShowProjectModal(null)}>
           <form onSubmit={handleSaveProject} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</label>
                    <input name="name" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.name : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Descriptor</label>
                    <input name="location" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.location : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Budget (£)</label>
                    <input name="budget" type="number" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.baselines.totalBudget : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Objective (m²)</label>
                    <input name="m2" type="number" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.baselines.plannedM2 : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Commencement</label>
                    <input name="start" type="date" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.baselines.startDate : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Completion</label>
                    <input name="end" type="date" required defaultValue={typeof showProjectModal === 'object' ? showProjectModal.baselines.endDate : ''} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector Type</label>
                    <select name="type" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900">
                       <option>Residential</option>
                       <option>Commercial</option>
                       <option>Industrial</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baseline Status</label>
                    <select name="status" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900">
                       <option value="active">Active Operation</option>
                       <option value="bidding">Phase: Bidding</option>
                       <option value="completed">Completed / Handed Over</option>
                    </select>
                 </div>
              </div>
              <button className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all mt-4">Establish Operational Protocol</button>
           </form>
        </Modal>
      )}

      {showAssetModal && (
        <Modal title="Upload Documentation" onClose={() => setShowAssetModal(false)}>
           <form onSubmit={handleUploadFloorPlan} className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Title</label>
                 <input name="name" placeholder="e.g. Ground Floor Core Blueprint" required className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-slate-900" />
              </div>
              <div className="h-48 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
                 <input type="file" name="file" accept="image/*" required className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                 <Upload size={32} className="text-slate-300 mb-4 group-hover:text-indigo-500 transition-colors" />
                 <p className="text-[10px] font-black uppercase text-slate-400">Drag & Drop Site Blueprint</p>
              </div>
              <button className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">Archive Document</button>
           </form>
        </Modal>
      )}
    </div>
  );
}
