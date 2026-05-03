import { useState, useEffect } from 'react';
import { getProjects, getUsers } from '../api';
import ProjectModal from '../components/ProjectModal';
import useAuth from '../hooks/useAuth';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [modal, setModal]       = useState(null);

  const load = () => {
    getProjects().then(r => setProjects(r.data));
    getUsers().then(r => setUsers(r.data));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={() => setModal('create')}>+ New Project</button>
        )}
      </div>

      <div className="projects-grid">
        {projects.map(p => {
          const members = users.filter(u => p.member_ids?.includes(u.id));
          return (
            <div key={p.id} className="project-card">
              <div className="project-header">
                <span className="project-dot" style={{background: p.color}}/>
                <span className="project-name">{p.name}</span>
                {user.role === 'admin' && (
                  <button className="btn-sm" onClick={() => setModal(p)}>Edit</button>
                )}
              </div>
              <p className="project-desc">{p.description}</p>
              <div className="project-members">
                {members.slice(0,4).map(u => (
                  <div key={u.id} className="mini-avatar" style={{background: u.color}} title={u.name}>
                    {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                ))}
              </div>
              <div className="project-footer">
                <span className="project-deadline">Due {p.deadline?.slice(0,10)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          users={users}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}