import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';

export const Notifications = () => {
  const [notes, setNotes] = useState([]);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const res = await notificationsAPI.getNotifications(); setNotes(res.data.notifications); } catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try { await notificationsAPI.markAsRead(id); await load(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <div className="space-y-3">
          {notes.length === 0 ? <div className="bg-white p-4 rounded shadow">No notifications</div> : notes.map(n => (
            <div key={n._id} className={`bg-white p-4 rounded shadow flex justify-between ${n.read ? 'opacity-60' : ''}`}>
              <div>
                <p className="font-bold">{n.type}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <button onClick={()=>markRead(n._id)} className="bg-blue-600 text-white px-3 py-2 rounded">Mark read</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
