
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  Package, 
  MessageSquare, 
  Settings, 
  Menu, 
  X,
  Plus,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Search,
  Bell,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  Calendar,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Clock,
  Target
} from 'lucide-react';
import { MOCK_TEAM, MOCK_TASKS, MOCK_MATERIALS, PROJECT_BASELINES } from './constants';
import { TaskStatus, Role, TeamMember, Task, Material, Notification, ProjectBaselines, SubTask } from './types';
import { analyzeSiteProgress, chatWithSiteAssistant } from './services/geminiService';

// --- Constants ---

// Fix for error: Cannot find name 'INITIAL_NOTIFS'
const INITIAL_NOTIFS: Notification[] = [
  { id: '1', type: 'alert', title: 'Schedule Drift Alert', message: 'Block A Level 1 is currently trending 4 days behind baseline.', timestamp: new Date(), read: false },
  { id: '2', type: 'material', title: 'Sand Stock Critical', message: 'Sharp Sand inventory below minimum threshold (10 tonnes).', timestamp: new Date(), read: false },
  { id: '3', type: 'financial', title: 'Budget Opportunity', message: 'Fibre Reinforcement procurement cost reduced by 12% this month.', timestamp: new Date(), read: true },
];

// --- Sub-components ---

// Fix for error: Cannot find name 'ProgressBar'
const ProgressBar = ({ progress, status }: { progress: number, status: TaskStatus }) => {
  const isDelayed = status === TaskStatus.DELAYED;
  const isCompleted = status === TaskStatus.COMPLETED;
  
  const barColor = isDelayed ? 'bg-rose-500' : isCompleted ? 'bg-emerald-500' : 'bg-indigo-600';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">Execution Progress</span>
        <span className={isDelayed ? 'text-rose-600' : 'text-indigo-600'}>{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${barColor}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

const HealthGauge = ({ label, value, percentage, type, subtitle }: { label: string, value: string, percentage: number, type: 'budget' | 'time', subtitle?: string }) => {
  const isHealthy = percentage <= 100;
  const colorClass = isHealthy ? 'bg-indigo-600' : 'bg-rose-500';
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 min-w-[280px]">
      <div className="flex justify-between items-center mb-4">
         <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'budget' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
               {type === 'budget' ? <Wallet size={18} /> : <Calendar size={18} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
         </div>
         <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${isHealthy ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isHealthy ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
            {Math.abs(100 - percentage)}% {percentage > 100 ? 'Over' : 'Under'}
         </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-1">{value}</h3>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
         <div 
           className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
           style={{ width: `${Math.min(100, percentage)}%` }}
         ></div>
      </div>
    </div>
  );
};

// Fix for error: Type '{ key: any; task: any; team: any; }' is not assignable to type '{ task: Task; team: TeamMember[]; }'
// Explicitly using React.FC to allow standard React props like 'key'
interface TaskCardProps {
  task: Task;
  team: TeamMember[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, team }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-xl group">
      <div 
        className="p-6 md:p-8 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <h3 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h3>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   task.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                   task.status === TaskStatus.DELAYED ? 'bg-rose-100 text-rose-700' :
                   'bg-indigo-100 text-indigo-700'
               }`}>
                   {task.status.replace('_', ' ')}
               </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <div className="flex items-center gap-2"><LayoutDashboard size={14} className="text-indigo-500" /> {task.zone}</div>
               <div className="flex items-center gap-2"><TrendingUp size={14} className="text-indigo-500" /> {task.area} m²</div>
               <div className="flex items-center gap-2"><Calendar size={14} className="text-rose-500" /> {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</div>
               <div className="flex -space-x-2">
                  {task.assignedTo.map(id => {
                     const staff = team.find(m => m.id === id);
                     return staff ? <img key={id} src={staff.avatar} className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-slate-100" title={staff.name} /> : null;
                  })}
               </div>
            </div>
          </div>
          <div className="lg:w-80 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Phase Progress</span>
                <span className="text-indigo-600 font-black text-sm">{task.progress}%</span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full bg-indigo-500 transition-all duration-700`} style={{ width: `${task.progress}%` }}></div>
             </div>
             <div className="flex justify-center">
                <ChevronDown size={16} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
             </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 md:px-8 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Granular Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.subTasks.map(sub => (
              <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-700">{sub.title}</p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase mt-1">{sub.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400">{sub.progress}%</span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${sub.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Fix for error: Cannot find name 'AIAssistant'
const AIAssistant = ({ context }: { context: any }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithSiteAssistant(userMsg, context);
      setMessages(prev => [...prev, { role: 'assistant', text: response || 'No response from ScreedFlow AI.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to ScreedFlow AI services.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">ScreedFlow AI Assistant</h3>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Strategy & Variance Analysis</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6">
              <Activity size={40} className="text-indigo-600" />
            </div>
            <h4 className="font-black text-slate-800 uppercase tracking-tight mb-2">Initialize Strategic Consultation</h4>
            <p className="text-sm text-slate-500 max-w-xs">Ask about budget variances, schedule risks, or resource allocation for Harbour Square.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-3xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg shadow-indigo-600/20' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query (e.g., 'What is our current schedule drift?')..."
            className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-6 pr-16 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Pages ---

const Dashboard = ({ tasks, materials, team, currentUser, baselines }: any) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const isAdmin = currentUser.accessLevel === 'Admin';

  const totals = useMemo(() => {
    const totalArea = tasks.reduce((acc: number, t: any) => acc + t.area, 0);
    const completedArea = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED).reduce((acc: number, t: any) => acc + t.area, 0);
    const physicalProgress = (completedArea / totalArea) * 100;

    const materialCost = materials.reduce((acc: number, m: any) => acc + (m.unitCost * (totalArea * m.usagePerSqm)), 0);
    const budgetUtilized = (materialCost / baselines.materialBudget) * 100;

    const start = new Date(baselines.startDate).getTime();
    const end = new Date(baselines.endDate).getTime();
    const now = new Date().getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const timeUtilized = (elapsed / totalDuration) * 100;

    return { totalArea, completedArea, physicalProgress, budgetUtilized, timeUtilized, materialCost };
  }, [tasks, materials, baselines]);

  const generateReport = async () => {
    setLoadingReport(true);
    const report = await analyzeSiteProgress(tasks, materials, team, baselines);
    setAiReport(report);
    setLoadingReport(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Command Center</h1>
          <p className="text-sm text-slate-500 font-medium">Site: Harbour Square • Status: Live Deployment</p>
        </div>
        {isAdmin && (
          <button 
            onClick={generateReport}
            disabled={loadingReport}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 group active:scale-95"
          >
            <Activity size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">
              {loadingReport ? 'Simulating Impacts...' : 'Predict Project Risks'}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
         <HealthGauge 
           label="Contract Budget Control" 
           value={`£${Math.round(totals.materialCost).toLocaleString()}`} 
           percentage={Math.round(totals.budgetUtilized)} 
           type="budget" 
           subtitle={`Baseline: £${baselines.materialBudget.toLocaleString()}`}
         />
         <HealthGauge 
           label="Global Schedule Health" 
           value={`${Math.round(totals.physicalProgress)}% Physical Done`} 
           percentage={Math.round(totals.timeUtilized)} 
           type="time" 
           subtitle={`Target Finish: ${new Date(baselines.endDate).toLocaleDateString()}`}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {aiReport && (
            <div className="bg-slate-900 text-indigo-50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
               <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-indigo-600 p-3 rounded-2xl">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white uppercase tracking-tight">AI Strategy Insight</h3>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Mitigation & Risk Modeling</p>
                  </div>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-indigo-100/80 whitespace-pre-wrap leading-relaxed space-y-4">
                  {aiReport}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <ListTodo size={24} className="text-indigo-600" />
                Active Job Streams
              </h3>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                 <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              </div>
            </div>
            <div className="space-y-6">
              {tasks.filter(t => t.status !== TaskStatus.COMPLETED).map((task: Task) => (
                <div key={task.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-800 text-base uppercase tracking-tight">{task.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Due: {task.endDate}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      task.status === TaskStatus.DELAYED ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <ProgressBar progress={task.progress} status={task.status} />
                  <div className="mt-4 flex items-center gap-4">
                     <div className="text-[10px] font-black text-slate-400 uppercase">Sub-tasks: {task.subTasks.filter(s => s.status === TaskStatus.COMPLETED).length}/{task.subTasks.length} Done</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Variance Tracking</h3>
            <div className="space-y-6">
               <div className="p-5 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Drift</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-rose-600">+14</span>
                     <span className="text-xs font-bold text-slate-500 uppercase">Days</span>
                  </div>
               </div>
               <div className="p-5 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cost Variance</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-emerald-600">-£2.4k</span>
                     <span className="text-xs font-bold text-slate-500 uppercase">Saving</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <Target size={24} className="opacity-80" />
                <h3 className="font-black text-sm uppercase tracking-[0.2em] opacity-80">Daily Target</h3>
             </div>
             <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                   <span>Current Output</span>
                   <span>Target</span>
                </div>
                <div className="flex items-baseline justify-between">
                   <span className="text-4xl font-black">118</span>
                   <span className="text-xl font-black opacity-40">/ 150</span>
                </div>
                <p className="text-xs font-bold opacity-60">Square meters per day</p>
             </div>
             <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-white" style={{ width: '78%' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectControls = ({ baselines }: { baselines: ProjectBaselines }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Contract Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Define original schedule and budget baselines here.</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
           Save Baselines
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3">
             <Wallet size={20} className="text-indigo-600" />
             Financial Baselines
           </h3>
           <div className="space-y-6">
              {[
                { label: 'Material Budget', value: baselines.materialBudget, icon: Package },
                { label: 'Labour Budget', value: baselines.labourBudget, icon: Users },
                { label: 'Contingency Fund', value: baselines.contingency, icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</label>
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 font-bold">£</span>
                      <input 
                        type="text" 
                        defaultValue={item.value.toLocaleString()} 
                        className="bg-transparent border-none focus:ring-0 text-slate-800 font-black flex-1"
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3">
             <Clock size={20} className="text-indigo-600" />
             Timeline Baselines
           </h3>
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                   <input type="date" defaultValue={baselines.startDate} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-bold" />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                   <input type="date" defaultValue={baselines.endDate} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-bold" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Sqm Daily</label>
                 <input type="number" defaultValue={baselines.targetDailySqm} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 font-black" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'tasks' | 'materials' | 'chat' | 'controls'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);
  
  const [currentUser, setCurrentUser] = useState<TeamMember>(MOCK_TEAM[0]); 
  const [team] = useState<TeamMember[]>(MOCK_TEAM);
  const [tasks] = useState<Task[]>(MOCK_TASKS);
  const [materials] = useState<Material[]>(MOCK_MATERIALS);
  const [baselines] = useState<ProjectBaselines>(PROJECT_BASELINES);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'tasks', label: 'Schedule', icon: ListTodo },
    { id: 'materials', label: 'Inventory', icon: Package },
    { id: 'team', label: 'Crew', icon: Users },
    { id: 'chat', label: 'Strategy AI', icon: MessageSquare },
    { id: 'controls', label: 'Baselines', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12">
               <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/40">
                  <TrendingUp className="text-white" size={24} />
               </div>
               <h1 className="text-xl font-black text-white tracking-tighter uppercase">ScreedFlow <span className="text-indigo-400">Pro</span></h1>
            </div>
            
            <nav className="space-y-2">
              {navItems.filter(item => !item.adminOnly || currentUser.accessLevel === 'Admin').map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-600/40 translate-x-1' 
                      : 'hover:bg-slate-800 hover:text-white opacity-60 hover:opacity-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-6">
            <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
               <div className="flex items-center gap-3 mb-4">
                  <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-indigo-500/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{currentUser.role}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => {
                    const nextIdx = (MOCK_TEAM.indexOf(currentUser) + 1) % MOCK_TEAM.length;
                    setCurrentUser(MOCK_TEAM[nextIdx]);
                  }} className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all border border-indigo-500/20">
                    Switch ID
                  </button>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 md:px-10 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 hover:bg-slate-50 rounded-2xl text-slate-600">
              <Menu size={22} />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contract: Harbour Square</p>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Deployment Baseline v2.1</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showNotifs ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-black">{unreadCount}</span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                       <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Adverse Alerts</h4>
                       <button onClick={() => setNotifications([])} className="text-[10px] text-indigo-600 font-black uppercase hover:underline">Clear</button>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{n.title}</p>
                           <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-12">
            {activeTab === 'dashboard' && <Dashboard tasks={tasks} materials={materials} team={team} currentUser={currentUser} baselines={baselines} />}
            {activeTab === 'tasks' && (
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gantt Breakdown</h1>
                      <p className="text-sm text-slate-500 font-medium">Tracking sub-tasks and schedules against milestones.</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    {tasks.map(task => <TaskCard key={task.id} task={task} team={team} />)}
                 </div>
              </div>
            )}
            {activeTab === 'materials' && (
               <div className="space-y-10">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Inventory Ledger</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {materials.map(mat => (
                      <div key={mat.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                         <h4 className="font-black text-slate-800 text-base uppercase mb-4">{mat.name}</h4>
                         <p className="text-3xl font-black text-slate-900 mb-6">{mat.stock} <span className="text-xs text-slate-400">{mat.unit}</span></p>
                         <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: '60%' }}></div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
            {activeTab === 'team' && (
               <div className="space-y-10">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Deployment Roster</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {team.map(member => (
                      <div key={member.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                         <img src={member.avatar} className="w-16 h-16 rounded-2xl object-cover" />
                         <div>
                            <p className="font-black text-slate-800">{member.name}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase">{member.role}</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
            {activeTab === 'chat' && <AIAssistant context={{ tasks, materials, team, currentUser, baselines }} />}
            {activeTab === 'controls' && <ProjectControls baselines={baselines} />}
          </div>
        </main>
      </div>
    </div>
  );
}
