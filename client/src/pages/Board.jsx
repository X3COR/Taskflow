import { useState, useEffect } from 'react';
import { getTasks, updateTask } from '../api';

const COLS = [
  { key: 'todo',   label: 'To do',       color: '#64748b' },
  { key: 'inprog', label: 'In Progress',  color: '#f59e0b' },
  { key: 'done',   label: 'Done',         color: '#22c55e' },
];

export default function Board() {
  const [tasks, setTasks] = useState([]);

  const load = () => getTasks().then(r => setTasks(r.data));
  useEffect(() => { load(); }, []);

  const moveTask = async (task, newStatus) => {
    await updateTask(task.id, { status: newStatus });
    load();
  };

  return (
    <div>
      <div className="page-header"><h2>Board</h2></div>
      <div className="kanban">
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className="col-dot" style={{background: col.color}}/>
                <span>{col.label}</span>
                <span className="col-count">{colTasks.length}</span>
              </div>
              {colTasks.map(t => (
                <div key={t.id} className="kanban-card">
                  <div className="kanban-card-title">{t.title}</div>
                  <div className="kanban-card-footer">
                    <span className={`badge ${t.priority}`}>{t.priority}</span>
                    <div style={{display:'flex',gap:'4px'}}>
                      {col.key !== 'todo'   && <button className="btn-xs" onClick={() => moveTask(t,'todo')}>←</button>}
                      {col.key !== 'done'   && <button className="btn-xs" onClick={() => moveTask(t,col.key==='todo'?'inprog':'done')}>→</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}