import { useState } from 'react';
import { createTask, updateTask } from '../api';
import useAuth from '../hooks/useAuth';

export default function TaskModal({ task, projects, users, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title:       task?.title       || '',
    project_id:  task?.project_id  || projects[0]?.id || '',
    assignee_id: task?.assignee_id || user.id,
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'med',
    due_date:    task?.due_date?.slice(0,10) || '',
  });
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.title || !form.due_date) { setError('Title and due date required'); return; }
    try {
      task ? await updateTask(task.id, form) : await createTask(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{task ? 'Edit Task' : 'New Task'}</h3>
        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
        </div>
        <div className="form-group">
          <label>Project</label>
          <select value={form.project_id} onChange={e => set('project_id', parseInt(e.target.value))}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {user.role === 'admin' && (
          <div className="form-group">
            <label>Assignee</label>
            <select value={form.assignee_id} onChange={e => set('assignee_id', parseInt(e.target.value))}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="todo">To do</option>
              <option value="inprog">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Due date</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>
            {task ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}