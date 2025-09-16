import React, { useState } from 'react';
import { Save, Clock, Calendar, Users, Bell, Shield, Database, Plus, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('academic');
  const [settings, setSettings] = useState({
    institution: {
      name: 'University of Excellence',
      address: '123 Education Street, Academic City',
      contact: '+1-234-567-8900',
      email: 'admin@university.edu'
    },
    academic: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      breakStartTime: '11:00',
      breakEndTime: '11:15',
      lunchStartTime: '13:00',
      lunchEndTime: '14:00',
      periods: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:15', end: '12:15' },
        { start: '12:15', end: '13:15' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
      ]
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
      localStorage.setItem('timetable-settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const addPeriod = () => {
    const lastPeriod = settings.academic.periods[settings.academic.periods.length - 1];
    const newStart = new Date(`1970-01-01T${lastPeriod.end}:00`);
    newStart.setMinutes(newStart.getMinutes());
    const newEnd = new Date(newStart.getTime());
    newEnd.setHours(newEnd.getHours() + 1);

    const newPeriod = {
        start: newStart.toTimeString().slice(0,5),
        end: newEnd.toTimeString().slice(0,5)
    }

    setSettings(prev => ({
        ...prev,
        academic: {
            ...prev.academic,
            periods: [...prev.academic.periods, newPeriod]
        }
    }))
  }

  const removePeriod = (index: number) => {
    setSettings(prev => ({
        ...prev,
        academic: {
            ...prev.academic,
            periods: prev.academic.periods.filter((_, i) => i !== index)
        }
    }))
  }

  const handlePeriodChange = (index: number, field: 'start' | 'end', value: string) => {
    const newPeriods = [...settings.academic.periods];
    newPeriods[index][field] = value;
    setSettings(prev => ({
        ...prev,
        academic: {
            ...prev.academic,
            periods: newPeriods
        }
    }))
  }

  return (
    <div className="space-y-6">
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

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Academic Calendar Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Break Start Time</label>
                    <input type="time" value={settings.academic.breakStartTime} onChange={(e) => setSettings({...settings, academic: {...settings.academic, breakStartTime: e.target.value}})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Break End Time</label>
                    <input type="time" value={settings.academic.breakEndTime} onChange={(e) => setSettings({...settings, academic: {...settings.academic, breakEndTime: e.target.value}})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lunch Start Time</label>
                    <input type="time" value={settings.academic.lunchStartTime} onChange={(e) => setSettings({...settings, academic: {...settings.academic, lunchStartTime: e.target.value}})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lunch End Time</label>
                    <input type="time" value={settings.academic.lunchEndTime} onChange={(e) => setSettings({...settings, academic: {...settings.academic, lunchEndTime: e.target.value}})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                  </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mt-4">Periods</h3>
                    <div className="space-y-2 mt-2">
                        {settings.academic.periods.map((period, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input type="time" value={period.start} onChange={(e) => handlePeriodChange(index, 'start', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                                <span>-</span>
                                <input type="time" value={period.end} onChange={(e) => handlePeriodChange(index, 'end', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
                                <button onClick={() => removePeriod(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addPeriod} className="mt-2 inline-flex items-center px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Period
                    </button>
                </div>
              </div>
            )}
            {/* Other tabs remain unchanged */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;