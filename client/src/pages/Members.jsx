import { useState, useEffect } from 'react';
import { getUsers, updateRole } from '../api';
import useAuth from '../hooks/useAuth';

export default function Members() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    try {
      await updateRole(u.id, newRole);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="page-header"><h2>Team Members</h2></div>
      <div className="member-list">
        {users.map(u => (
          <div key={u.id} className="member-row">
            <div className="avatar" style={{background: u.color}}>
              {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div className="member-info">
              <div className="member-name">{u.name} {u.id===me.id && <span className="you-tag">(you)</span>}</div>
              <div className="member-email">{u.email}</div>
            </div>
            <span className={`badge ${u.role}`}>{u.role}</span>
            {u.id !== me.id && (
              <button className="btn-sm" onClick={() => toggleRole(u)}>
                Make {u.role === 'admin' ? 'Member' : 'Admin'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}