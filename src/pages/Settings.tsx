import React, { useState } from 'react';
import { Save, Clock, Calendar, Users, Bell, Shield, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    institution: {
      name: 'University of Excellence',
      address: '123 Education Street, Academic City',
      contact: '+1-234-567-8900',
      email: 'admin@university.edu'
    },
    academic: {
      slotDuration: '60',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '17:00',
      lunchBreak: '12:00-13:00',
      semester: 'Fall 2024'
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      publishAlerts: true,
      conflictAlerts: true,
      approvalReminders: true
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Database },
    { id: 'academic', label: 'Academic Calendar', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Users }
  ];

  const handleSave = () => {
    try {
      // Here you would typically save to a backend or localStorage
      localStorage.setItem('timetable-settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your timetable management system</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Institution Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      value={settings.institution.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        institution: { ...settings.institution, name: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.institution.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        institution: { ...settings.institution, email: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={settings.institution.address}
                      onChange={(e) => setSettings({
                        ...settings,
                        institution: { ...settings.institution, address: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Calendar */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Academic Calendar Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot Duration (minutes)
                    </label>
                    <select
                      value={settings.academic.slotDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        academic: { ...settings.academic, slotDuration: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <input
                      type="text"
                      value={settings.academic.semester}
                      onChange={(e) => setSettings({
                        ...settings,
                        academic: { ...settings.academic, semester: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.academic.startTime}
                      onChange={(e) => setSettings({
                        ...settings,
                        academic: { ...settings.academic, startTime: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily End Time
                    </label>
                    <input
                      type="time"
                      value={settings.academic.endTime}
                      onChange={(e) => setSettings({
                        ...settings,
                        academic: { ...settings.academic, endTime: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.academic.workingDays.includes(day)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...settings.academic.workingDays, day]
                              : settings.academic.workingDays.filter(d => d !== day);
                            setSettings({
                              ...settings,
                              academic: { ...settings.academic, workingDays: days }
                            });
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email alerts for system events</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailEnabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive text messages for critical alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsEnabled: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Timetable Published</h3>
                      <p className="text-sm text-gray-500">Alert when timetables are published</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.publishAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, publishAlerts: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs would be implemented similarly */}
            {(activeTab === 'security' || activeTab === 'integrations') && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                  <p className="text-sm">This section is under development and will be available in the next update.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;