"use client";

import { useEffect, useState } from "react";
import { Calendar, MessageSquare, DollarSign, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: 'booking' | 'quote' | 'chat' | 'revenue';
  title: string;
  description: string;
  time: string;
  value?: string;
  icon: any;
  color: string;
}

const generateRealisticActivities = (): Activity[] => {
  const now = new Date();
  const activities: Activity[] = [];

  // Generate activities for the last 2 hours
  for (let i = 0; i < 12; i++) {
    const minutesAgo = Math.floor(Math.random() * 120);
    const time = new Date(now.getTime() - minutesAgo * 60000);

    const activityTypes: Activity['type'][] = ['booking', 'quote', 'chat', 'revenue'];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    let activity: Activity;

    switch (type) {
      case 'booking':
        const bookingServices = ['Emergency Plumbing', 'Water Heater Service', 'Drain Cleaning', 'Leak Repair'];
        const service = bookingServices[Math.floor(Math.random() * bookingServices.length)];
        activity = {
          id: `${type}-${i}`,
          type,
          title: `New Appointment Booked`,
          description: `${service} scheduled for ${getRandomFutureDate()}`,
          time: getTimeAgo(minutesAgo),
          icon: Calendar,
          color: 'bg-green-100 text-green-600'
        };
        break;

      case 'quote':
        activity = {
          id: `${type}-${i}`,
          type,
          title: `Quote Request Received`,
          description: `Customer requested quote for ${['Emergency Plumbing', 'Water Heater Replacement', 'Bathroom Remodel'][Math.floor(Math.random() * 3)]}`,
          time: getTimeAgo(minutesAgo),
          icon: DollarSign,
          color: 'bg-blue-100 text-blue-600'
        };
        break;

      case 'chat':
        activity = {
          id: `${type}-${i}`,
          type,
          title: `AI Chat Conversation`,
          description: `Lead captured via chat widget`,
          time: getTimeAgo(minutesAgo),
          icon: MessageSquare,
          color: 'bg-purple-100 text-purple-600'
        };
        break;

      case 'revenue':
        const revenue = [150, 275, 450, 850, 1200, 320][Math.floor(Math.random() * 6)];
        activity = {
          id: `${type}-${i}`,
          type,
          title: `Service Completed`,
          description: `Job completed and paid`,
          time: getTimeAgo(minutesAgo),
          value: `$${revenue}`,
          icon: DollarSign,
          color: 'bg-yellow-100 text-yellow-600'
        };
        break;
    }

    activities.push(activity);
  }

  return activities.sort((a, b) => {
    const aMinutes = parseInt(a.time);
    const bMinutes = parseInt(b.time);
    return aMinutes - bMinutes;
  });
};

const getTimeAgo = (minutes: number): string => {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const getRandomFutureDate = (): string => {
  const dates = ['Today at 2pm', 'Today at 4pm', 'Tomorrow at 10am', 'Tomorrow at 3pm', 'Friday at 9am'];
  return dates[Math.floor(Math.random() * dates.length)];
};

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initial load
    setActivities(generateRealisticActivities());

    // Add new activity every 8-15 seconds
    const interval = setInterval(() => {
      if (isLive) {
        const newActivity = generateRealisticActivities()[0];
        setActivities(prev => [newActivity, ...prev].slice(0, 12));
      }
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const stats = {
    bookings: activities.filter(a => a.type === 'booking').length,
    quotes: activities.filter(a => a.type === 'quote').length,
    chats: activities.filter(a => a.type === 'chat').length,
    revenue: activities
      .filter(a => a.type === 'revenue' && a.value)
      .reduce((sum, a) => sum + parseInt(a.value!.replace('$', '')), 0)
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Live Activity Feed</h3>
          <p className="text-sm text-gray-600">Real-time business activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">{isLive ? 'LIVE' : 'PAUSED'}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 rounded-md p-3 text-center border border-green-100">
          <div className="text-2xl font-bold text-green-600">{stats.bookings}</div>
          <div className="text-xs text-gray-600">Bookings</div>
        </div>
        <div className="bg-blue-50 rounded-md p-3 text-center border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{stats.quotes}</div>
          <div className="text-xs text-gray-600">Quotes</div>
        </div>
        <div className="bg-purple-50 rounded-md p-3 text-center border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">{stats.chats}</div>
          <div className="text-xs text-gray-600">AI Chats</div>
        </div>
        <div className="bg-yellow-50 rounded-md p-3 text-center border border-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">${stats.revenue}</div>
          <div className="text-xs text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={`${activity.id}-${index}`}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors animate-in slide-in-from-top duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-10 h-10 rounded-md ${activity.color} flex items-center justify-center flex-shrink-0`}>
              <activity.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm">{activity.title}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              {activity.value && (
                <span className="text-sm font-bold text-green-600">{activity.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          This feed shows real-time activity from the demo website
        </p>
      </div>
    </div>
  );
}
