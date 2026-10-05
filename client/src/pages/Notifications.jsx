import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import { Card3D } from '../components/ui/Card3D';
import { PageSkeleton } from '../components/ui/Skeleton';
import { useLanguage } from '../context/LanguageContext';

export const Notifications = () => {
  const { language, t } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); }, []);

  const load = async () => {
    try { const res = await notificationsAPI.getNotifications(); setNotes(res.data.notifications); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await notificationsAPI.markAsRead(id); await load(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('Notifications')}</h1>
        {loading ? <PageSkeleton /> : <div className="space-y-3">
          {notes.length === 0 ? <div className="glass p-4">{t('No notifications')}</div> : notes.map(n => (
            <Card3D key={n._id} className={`notification-card p-4 flex justify-between ${n.read ? 'opacity-60' : ''}`}>
              <div>
                <p className="font-bold">{n.type}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : undefined)}</p>
              </div>
              {!n.read && <button onClick={()=>markRead(n._id)} className="bg-blue-600 text-white px-3 py-2 rounded">{t('Mark read')}</button>}
            </Card3D>
          ))}
        </div>}
      </div>
    </div>
  );
};
