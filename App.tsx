
import React, { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { MOCK_TEAM, MOCK_TASKS, MOCK_MATERIALS } from './constants';
import { TaskStatus, Role, TeamMember, Task, Material } from './types';
import { analyzeSiteProgress, chatWithSiteAssistant } from './services/geminiService';

// --- Sub-components ---

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-2.5 md:p-3 rounded-lg ${color}`}>
        <Icon size={18} className="text-white md:w-5 md:h-5" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ progress, status }: { progress: number, status: TaskStatus }) => {
  const getColor = () => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-green-500';
      case TaskStatus.DELAYED: return 'bg-red-500';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-500';
      default: return 'bg-slate-300';
    }
  };
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-1000 ${getColor()}`} style={{ width: `${progress}%` }}></div>
    </div>
  );
};

// --- Main Pages ---

const Dashboard = ({ tasks, materials, team }: any) => {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const generateReport = async () => {
    setLoadingReport(true);
    const report = await analyzeSiteProgress(tasks, materials, team);
    setAiReport(report);
    setLoadingReport(false);
  };

  const completedSqm = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED).reduce((acc: number, t: any) => acc + t.area, 0);
  const totalSqm = tasks.reduce((acc: number, t: any) => acc + t.area, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Site Overview</h1>
        <button 
          onClick={generateReport}
          disabled={loadingReport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <TrendingUp size={18} />
          {loadingReport ? 'Analyzing...' : 'Generate AI Site Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Area" value={`${totalSqm} m²`} subValue={`${completedSqm} m² completed`} icon={LayoutDashboard} color="bg-indigo-500" />
        <StatCard title="Active Team" value={team.filter((m: any) => m.status === 'active').length} subValue="On site today" icon={Users} color="bg-blue-500" />
        <StatCard title="Ongoing Tasks" value={tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length} subValue="Requiring attention" icon={ListTodo} color="bg-amber-500" />
        <StatCard title="Critical Materials" value={materials.filter((m: any) => m.stock < m.minimumRequired).length} subValue="Below safety limit" icon={Package} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Recent Task Activity
            </h3>
            <div className="space-y-4">
              {tasks.slice(0, 4).map((task: Task) => (
                <div key={task.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{task.title}</h4>
                      <p className="text-xs text-slate-500">{task.zone} • {task.area} m²</p>
                    </div>
                    <span className={`self-start px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                      task.status === TaskStatus.DELAYED ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{task.progress}%</span>
                    </div>
                    <ProgressBar progress={task.progress} status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {aiReport && (
            <div className="bg-white border-l-4 border-indigo-500 p-5 md:p-6 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold uppercase text-xs tracking-wider">
                <AlertTriangle size={16} />
                AI Strategy Insight
              </div>
              <div className="prose prose-sm prose-indigo text-slate-600 whitespace-pre-wrap leading-relaxed">
                {aiReport}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-semibold mb-4">Stock Alerts</h3>
          <div className="space-y-4">
            {materials.map((mat: Material) => {
              const isLow = mat.stock < mat.minimumRequired;
              return (
                <div key={mat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{mat.name}</p>
                    <p className={`text-xs ${isLow ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {mat.stock} {mat.unit} available
                    </p>
                  </div>
                  {isLow ? (
                    <div className="bg-rose-100 p-2 rounded-full">
                      <AlertTriangle size={14} className="text-rose-600" />
                    </div>
                  ) : (
                    <div className="bg-green-100 p-2 rounded-full">
                      <ChevronRight size={14} className="text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamList = ({ team }: { team: TeamMember[] }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Deployment Team</h1>
      <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
        <Plus size={18} />
        Add Member
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {team.map((member) => (
        <div key={member.id} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-indigo-200 transition-colors group">
          <div className="relative">
            <img src={member.avatar} alt={member.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-slate-50 group-hover:border-indigo-100" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 text-base">{member.name}</h4>
            <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
            <p className="text-[10px] text-slate-400 mt-1">Joined {new Date(member.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MaterialInventory = ({ materials }: { materials: Material[] }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-slate-800">Materials & Logistics</h1>
      <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
        <Plus size={18} />
        Update Stock
      </button>
    </div>

    {/* Desktop Table */}
    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Item Name</th>
            <th className="px-6 py-4 text-center">Current Stock</th>
            <th className="px-6 py-4 text-center">Min. Required</th>
            <th className="px-6 py-4 text-center">Usage/m²</th>
            <th className="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {materials.map((mat) => (
            <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-800">{mat.name}</td>
              <td className="px-6 py-4 text-center text-slate-600">{mat.stock} {mat.unit}</td>
              <td className="px-6 py-4 text-center text-slate-500 italic">{mat.minimumRequired} {mat.unit}</td>
              <td className="px-6 py-4 text-center text-slate-600">{mat.usagePerSqm} {mat.unit}</td>
              <td className="px-6 py-4 text-right">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  mat.stock < mat.minimumRequired ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'
                }`}>
                  {mat.stock < mat.minimumRequired ? 'Critical' : 'Stable'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Card List */}
    <div className="md:hidden space-y-3">
      {materials.map((mat) => (
        <div key={mat.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-slate-800">{mat.name}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              mat.stock < mat.minimumRequired ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'
            }`}>
              {mat.stock < mat.minimumRequired ? 'Critical' : 'Stable'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-slate-500">Stock:</div>
            <div className="text-slate-800 font-medium text-right">{mat.stock} {mat.unit}</div>
            <div className="text-slate-500">Minimum:</div>
            <div className="text-slate-800 font-medium text-right">{mat.minimumRequired} {mat.unit}</div>
            <div className="text-slate-500">Usage:</div>
            <div className="text-slate-800 font-medium text-right">{mat.usagePerSqm} {mat.unit}/m²</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AIAssistant = ({ context }: any) => {
    const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
        { role: 'assistant', content: 'Hello Project Manager! I am ScreedFlow AI. How can I help you with the screeding deployment today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const aiResponse = await chatWithSiteAssistant(userMsg, context);
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsTyping(false);
        }
    }

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-[calc(100vh-14rem)] min-h-[400px]">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">ScreedFlow AI</h3>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Screeding Intelligence</p>
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-green-700 font-bold uppercase">Online</span>
                </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl shadow-sm ${
                            m.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
                            <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about project data..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/20 flex items-center justify-center"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}

// --- App Shell ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'tasks' | 'materials' | 'chat'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Data State
  const [team] = useState<TeamMember[]>(MOCK_TEAM);
  const [tasks] = useState<Task[]>(MOCK_TASKS);
  const [materials] = useState<Material[]>(MOCK_MATERIALS);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'tasks', label: 'Task List', icon: ListTodo },
    { id: 'materials', label: 'Inventory', icon: Package },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const switchTab = (tab: any) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out transform shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">ScreedFlow <span className="text-indigo-400">Pro</span></h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-indigo-600 text-white font-semibold shadow-xl shadow-indigo-600/30 ring-1 ring-white/10' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-6">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shadow-inner">AM</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">Alex Miller</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Project Lead</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all border border-transparent hover:border-slate-600">
                <Settings size={14} />
                Manage Settings
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 border border-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Site</p>
              <h2 className="text-sm font-bold text-slate-800">Harbour Square Phase II</h2>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg mx-3 md:mx-6 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer relative">
                <MessageSquare size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">2</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto pb-24 lg:pb-10">
            {activeTab === 'dashboard' && <Dashboard tasks={tasks} materials={materials} team={team} />}
            {activeTab === 'team' && <TeamList team={team} />}
            {activeTab === 'materials' && <MaterialInventory materials={materials} />}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h1 className="text-2xl font-bold text-slate-800">Job Progress & Schedule</h1>
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                          <Plus size={18} />
                          New Task
                      </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                      {tasks.map(task => (
                          <div key={task.id} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center flex-wrap gap-2 mb-2">
                                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors truncate">{task.title}</h3>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                              task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                              task.status === TaskStatus.DELAYED ? 'bg-rose-100 text-rose-700' :
                                              'bg-blue-100 text-blue-700'
                                          }`}>
                                              {task.status.replace('_', ' ')}
                                          </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500">
                                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><LayoutDashboard size={14} className="text-indigo-500" /> {task.zone}</span>
                                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><TrendingUp size={14} className="text-indigo-500" /> {task.area} m²</span>
                                          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Users size={14} className="text-indigo-500" /> {task.assignedTo.length} Staff</span>
                                      </div>
                                  </div>
                                  <div className="md:w-72 lg:w-80 space-y-2">
                                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                          <span className="uppercase tracking-widest text-slate-400">Task Completion</span>
                                          <span className="text-indigo-600">{task.progress}%</span>
                                      </div>
                                      <ProgressBar progress={task.progress} status={task.status} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            )}
            {activeTab === 'chat' && <AIAssistant context={{ tasks, materials, team }} />}
          </div>
        </main>
        
        {/* Mobile Navigation Dock */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-up">
           <button onClick={() => switchTab('dashboard')} className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
              <LayoutDashboard size={22} />
           </button>
           <button onClick={() => switchTab('tasks')} className={`p-2 rounded-xl ${activeTab === 'tasks' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
              <ListTodo size={22} />
           </button>
           <button onClick={() => switchTab('chat')} className="p-3 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-600/40 -mt-8 border-4 border-slate-50">
              <MessageSquare size={24} />
           </button>
           <button onClick={() => switchTab('materials')} className={`p-2 rounded-xl ${activeTab === 'materials' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
              <Package size={22} />
           </button>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl text-slate-400">
              <Menu size={22} />
           </button>
        </div>
      </div>
    </div>
  );
}
