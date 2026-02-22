import Layout from '../components/Layout';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskForm from '../components/tasks/TaskForm';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { exportTasksToCSV } from '../utils/exportCSV';
import TaskCalendar from '../components/TaskCalendar';
import ActivityLog from '../components/ActivityLog';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'calendar', or 'activity'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchTasks();

    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [navigate]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on('task_created', (newTask) => {
      console.log('🎉 Real-time: New task created!', newTask);
      setTasks(prevTasks => {
        const exists = prevTasks.find(t => t.id === newTask.id);
        if (exists) return prevTasks;
        return [...prevTasks, newTask];
      });
    });

    return () => {
      socket.off('task_created');
      disconnectSocket();
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task status updated!');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task moved successfully!');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    }
  };

  // Memoized filtered tasks for performance
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase().trim();
        const title = (task.title || '').toLowerCase();
        const description = (task.description || '').toLowerCase();
        matchesSearch = title.includes(search) || description.includes(search);
      }

      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === 'todo'), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === 'in_progress'), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(t => t.status === 'done'), [filteredTasks]);

  const TaskCard = useCallback(({ task }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 transition-colors">{task.description}</p>
          )}
          {task.due_date && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              📅 Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleEditTask(task)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            task.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
            task.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
            task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
            'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
          }`}>
            {task.priority}
          </span>
        </div>

        <div className="flex gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={() => handleStatusChange(task.id, 'todo')}
              className="text-xs px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
              title="Move to To Do"
            >
              ← To Do
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button
              onClick={() => handleStatusChange(task.id, 'in_progress')}
              className="text-xs px-3 py-1.5 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition font-medium"
              title="Move to In Progress"
            >
              {task.status === 'todo' ? '→' : '←'} Progress
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => handleStatusChange(task.id, 'done')}
              className="text-xs px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition font-medium"
              title="Move to Done"
            >
              → Done
            </button>
          )}
        </div>
      </div>
    </div>
  ), [handleEditTask, handleDeleteTask, handleStatusChange]);

  if (loading) {
    return (
      <Layout user={user}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">My Workspace</h1>
                <p className="text-gray-600 dark:text-gray-400 transition-colors">Track and manage your tasks efficiently</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {/* View Toggle */}
                <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === 'kanban'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📊 Board
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === 'calendar'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📅 Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('activity')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      viewMode === 'activity'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📜 Activity
                  </button>
                </div>

                <button
                  onClick={() => {
                    exportTasksToCSV(filteredTasks);
                    toast.success('Tasks exported successfully!');
                  }}
                  className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards - Only show in Kanban view */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{filteredTasks.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">To Do</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{todoTasks.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-3 shadow-lg shadow-slate-200 dark:shadow-slate-900/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">In Progress</p>
                    <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 transition-colors">{inProgressTasks.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-3 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">{doneTasks.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar - Only show in Kanban view */}
          {viewMode === 'kanban' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-8 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-colors min-w-[160px]"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-colors min-w-[160px]"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                        setFilterPriority('all');
                        toast.success('Filters cleared');
                      }}
                      className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-medium whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Results Message */}
          {viewMode === 'kanban' && (searchQuery || filterStatus !== 'all' || filterPriority !== 'all') && filteredTasks.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 mb-8 text-center border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="max-w-md mx-auto">
                <div className="bg-amber-100 dark:bg-amber-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No tasks found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                  We couldn't find any tasks matching your filters.
                  {searchQuery && (
                    <span className="block mt-2 font-medium text-indigo-600 dark:text-indigo-400">
                      "{searchQuery}"
                    </span>
                  )}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Conditional View Rendering */}
          {viewMode === 'calendar' ? (
            <TaskCalendar
              tasks={filteredTasks}
              onSelectTask={handleEditTask}
              onSelectSlot={(slotInfo) => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
            />
          ) : viewMode === 'activity' ? (
            <ActivityLog />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* To Do Column */}
                <Droppable droppableId="todo">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full"></div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg transition-colors">To Do</h3>
                        </div>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold px-3 py-1 rounded-full transition-colors">
                          {todoTasks.length}
                        </span>
                      </div>
                      
                      <div className="space-y-4 min-h-[200px]">
                        {todoTasks.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">Drag tasks here</p>
                          </div>
                        ) : (
                          todoTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? 'opacity-50' : ''}
                                >
                                  <TaskCard task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                {/* In Progress Column */}
                <Droppable droppableId="in_progress">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-violet-400 bg-violet-50/50 dark:bg-violet-900/20' 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full"></div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg transition-colors">In Progress</h3>
                        </div>
                        <span className="bg-violet-100 dark:bg-violet-700 text-violet-700 dark:text-violet-300 text-sm font-bold px-3 py-1 rounded-full transition-colors">
                          {inProgressTasks.length}
                        </span>
                      </div>
                      
                      <div className="space-y-4 min-h-[200px]">
                        {inProgressTasks.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="bg-violet-100 dark:bg-violet-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
                              <svg className="w-8 h-8 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">Drag tasks here</p>
                          </div>
                        ) : (
                          inProgressTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? 'opacity-50' : ''}
                                >
                                  <TaskCard task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>

                {/* Done Column */}
                <Droppable droppableId="done">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' 
                          : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg transition-colors">Done</h3>
                        </div>
                        <span className="bg-emerald-100 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm font-bold px-3 py-1 rounded-full transition-colors">
                          {doneTasks.length}
                        </span>
                      </div>
                      
                      <div className="space-y-4 min-h-[200px]">
                        {doneTasks.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
                              <svg className="w-8 h-8 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">Drag tasks here</p>
                          </div>
                        ) : (
                          doneTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? 'opacity-50' : ''}
                                >
                                  <TaskCard task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        task={editingTask}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onTaskCreated={(newTask) => {
          if (editingTask) {
            setTasks(tasks.map(t => t.id === newTask.id ? newTask : t));
            toast.success('Task updated successfully!');
          } else {
            setTasks([...tasks, newTask]);
            toast.success('Task created successfully!');
          }
          setShowTaskForm(false);
          setEditingTask(null);
        }}
      />
    </Layout>
  );
}

export default Dashboard;