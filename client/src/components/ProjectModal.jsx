import { useState } from 'react';
import { createProject, updateProject, deleteProject } from '../api';

export default function ProjectModal({ project, users, onClose, onSave }) {
  const [form, setForm] = useState({
    name:        project?.name        || '',
    description: project?.description || '',
    color:       project?.color       || '#e94560',
    deadline:    project?.deadline?.slice(0,10) || '',
    member_ids:  project?.member_ids  || [],
  });
  const [error, setError] = useState('');

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(id)
        ? f.member_ids.filter(x => x !== id)
        : [...f.member_ids, id]
    }));
  };

  const handleSave = async () => {
    if (!form.name) { setError('Name required'); return; }
    if (!form.member_ids.length) { setError('Add at least one member'); return; }
    try {
      project ? await updateProject(project.id, form) : await createProject(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await deleteProject(project.id);
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{project ? 'Edit Project' : 'New Project'}</h3>
        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Project name"/>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Short description"/>
        </div>
        <div className="form-group">
          <label>Color</label>
          <input type="color" value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} style={{width:'48px',height:'36px',padding:'2px',border:'none',cursor:'pointer'}}/>
        </div>
        <div className="form-group">
          <label>Deadline</label>
          <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))}/>
        </div>
        <div className="form-group">
          <label>Members</label>
          <div className="member-checkboxes">
            {users.map(u => (
              <label key={u.id} className="member-check-row">
                <input type="checkbox" checked={form.member_ids.includes(u.id)}
                  onChange={() => toggleMember(u.id)}/>
                <div className="mini-avatar" style={{background:u.color}}>
                  {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </div>
                {u.name}
              </label>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          {project && <button className="btn-danger" onClick={handleDelete}>Delete</button>}
          <button onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>{project?'Update':'Create'}</button>
        </div>
      </div>
    </div>
  );
}