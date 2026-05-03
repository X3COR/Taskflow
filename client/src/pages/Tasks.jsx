import { useState, useEffect } from 'react';
import { getTasks, updateTask, deleteTask, getProjects, getUsers } from '../api';
import useAuth from '../hooks/useAuth';
import TaskModal from '../components/TaskModal';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [filter, setFilter]     = useState('all');
  const [modal, setModal]       = useState(null); // null | 'create' | task object

  const load = () => {
    getTasks().then(r => setTasks(r.data));
    getProjects().then(r => setProjects(r.data));
    getUsers().then(r => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  const isOverdue = t => t.status !== 'done' && new Date(t.due_date) < new Date();

  const filtered = tasks.filter(t => {
    if (filter === 'todo')   return t.status === 'todo';
    if (filter === 'inprog') return t.status === 'inprog';
    if (filter === 'done')   return t.status === 'done';
    if (filter === 'overdue') return isOverdue(t);
    return true;
  });

  const toggle = async (t) => {
    await updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    load();
  };

  const projectName = (id) => projects.find(p => p.id === id)?.name || '';
  const assigneeName = (id) => users.find(u => u.id === id)?.name || '';

  return (
    <div>
      <div className="page-header">
        <h2>Tasks</h2>
        <button className="btn-primary" onClick={() => setModal('create')}>+ New Task</button>
      </div>

      <div className="filter-bar">
        {['all','todo','inprog','done','overdue'].map(f => (
          <button key={f} className={`filter-chip ${filter===f?'active':''}`}
            onClick={() => setFilter(f)}>
            {f === 'inprog' ? 'In Progress' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div className="task-list">
        {filtered.map(t => (
          <div key={t.id} className={`task-item ${isOverdue(t)?'overdue':''}`}>
            <input type="checkbox" checked={t.status==='done'} onChange={() => toggle(t)} />
            <div className="task-info">
              <div className={`task-title ${t.status==='done'?'done':''}`}>{t.title}</div>
              <div className="task-meta">
                <span className="project-tag">{projectName(t.project_id)}</span>
                <span className={`badge ${t.priority}`}>{t.priority}</span>
                <span className="task-date">{t.due_date?.slice(0,10)}</span>
              </div>
            </div>
            <span className="assignee-name">{assigneeName(t.assignee_id)}</span>
            <button className="btn-sm" onClick={() => setModal(t)}>Edit</button>
            {user.role === 'admin' && (
              <button className="btn-sm danger" onClick={() => remove(t.id)}>Del</button>
            )}
          </div>
        ))}
        {!filtered.length && <p className="empty">No tasks found.</p>}
      </div>

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          projects={projects}
          users={users}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}