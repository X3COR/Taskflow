import { useState, useEffect } from 'react';
import { getTasks, getProjects } from '../api';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getTasks().then(r => setTasks(r.data));
    getProjects().then(r => setProjects(r.data));
  }, []);

  const myTasks   = tasks.filter(t => t.assignee_id === user?.id);
  const done      = myTasks.filter(t => t.status === 'done').length;
  const inprog    = myTasks.filter(t => t.status === 'inprog').length;
  const overdue   = myTasks.filter(t =>
    t.status !== 'done' && new Date(t.due_date) < new Date()
  ).length;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">My tasks</div><div className="stat-value">{myTasks.length}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value green">{done}</div></div>
        <div className="stat-card"><div className="stat-label">In progress</div><div className="stat-value amber">{inprog}</div></div>
        <div className="stat-card"><div className="stat-label">Overdue</div><div className="stat-value red">{overdue}</div></div>
      </div>

      <h3 style={{marginBottom:'12px'}}>Recent tasks</h3>
      <div className="task-list">
        {tasks.slice(0,8).map(t => (
          <div key={t.id} className="task-item">
            <span className={`badge ${t.status}`}>{t.status}</span>
            <span className="task-title">{t.title}</span>
            <span className="task-date">{t.due_date?.slice(0,10)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}