import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  Check,
  X
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { TaskItem, TaskStats } from '../types';
import { useToast } from '../context/ToastContext';

export const TaskManagerPage: React.FC = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    in_progress: 0,
    todo: 0,
    urgent: 0,
    high: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');

  const loadTasksAndStats = async () => {
    try {
      const [listData, statsData] = await Promise.all([
        taskService.listTasks({
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        }),
        taskService.getStats(),
      ]);
      setTasks(listData);
      setStats(statsData);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksAndStats();
  }, [statusFilter, priorityFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setTags('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setTags(task.tags || '');
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          tags: tags.trim() || undefined,
        });
        showToast('Task updated successfully!', 'success');
      } else {
        await taskService.createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          tags: tags.trim() || undefined,
        });
        showToast('Task created successfully!', 'success');
      }
      setModalOpen(false);
      loadTasksAndStats();
    } catch {
      showToast('Failed to save task', 'error');
    }
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await taskService.updateTask(task.id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      loadTasksAndStats();
      showToast(
        nextStatus === 'completed' ? 'Task marked complete!' : 'Task reopened.',
        'info'
      );
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      showToast('Task deleted', 'info');
      loadTasksAndStats();
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Personal Productivity Hub</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Track goals, manage priorities, and execute AI-generated project task breakdowns.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</span>
          <div className="text-2xl font-extrabold text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.completed}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">In Progress</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{stats.in_progress}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Do</span>
          <div className="text-2xl font-extrabold text-slate-300 mt-1">{stats.todo}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Urgent</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{stats.urgent}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No tasks found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a new task above or generate a project breakdown in the AI Productivity tool to import tasks.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 truncate">
                  {/* Toggle Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-slate-700 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="truncate">
                    <span
                      className={`text-sm font-semibold truncate block ${
                        isDone ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {task.due_date && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    </span>
                  )}

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal (Add/Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Review cloud infrastructure roadmap"
                  className="w-full bg-slate-950 text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, links, or notes..."
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Work, AI, Important"
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold shadow-md shadow-emerald-500/20"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

