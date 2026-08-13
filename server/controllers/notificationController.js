import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const n = await Notification.findById(notificationId);
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    if (n.userId.toString() !== req.userId) return res.status(403).json({ message: 'Unauthorized' });

    n.read = true;
    await n.save();
    return res.json({ message: 'Marked as read', notification: n });
  } catch (error) {
    console.error('Mark notification error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
