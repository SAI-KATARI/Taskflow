import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import api from '../services/api';
import AvatarUpload from '../components/AvatarUpload';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    passwordsMatch: false
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    task_updates: true,
    task_assignments: true,
    task_completions: true,
    weekly_summary: true,
    task_reminders: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setProfileData({
      full_name: parsedUser.full_name,
      email: parsedUser.email
    });

    const savedNotifications = localStorage.getItem('notification_preferences');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [navigate]);

  useEffect(() => {
    const password = passwordData.new_password;
    
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      passwordsMatch: password === passwordData.confirm_password && password.length > 0
    });
  }, [passwordData.new_password, passwordData.confirm_password]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/users/${user.id}`, profileData);
      
      const updatedUser = {
        ...user,
        full_name: profileData.full_name,
        email: profileData.email
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password) {
      toast.error('Please enter your current password');
      return;
    }

    const allValid = Object.values(passwordValidation).every(v => v === true);
    
    if (!allValid) {
      toast.error('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      toast.success('Password changed successfully!');
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    
    setNotifications(updatedNotifications);

    try {
      await api.put(`/users/${user.id}/preferences`, updatedNotifications);
      localStorage.setItem('notification_preferences', JSON.stringify(updatedNotifications));
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Preference update error:', error);
      toast.error('Failed to update preferences');
      setNotifications(notifications);
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    
    toast.success(`Dark mode ${newDarkMode ? 'enabled' : 'disabled'}`);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'password', name: 'Password', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' }
  ];

  if (!user) {
    return (
      <Layout user={user}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">Manage your account settings and preferences</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 transition-colors">Profile Information</h3>
                    
                    {/* Avatar Upload Section */}
                    <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                      <AvatarUpload 
                        user={user} 
                        onAvatarUpdate={(newAvatar) => {
                          setUser({ ...user, avatar: newAvatar });
                        }}
                      />
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Enter new password"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors">Password Requirements:</p>
                        <div className="space-y-2">
                          {Object.entries({
                            minLength: 'At least 8 characters',
                            hasUppercase: 'One uppercase letter',
                            hasLowercase: 'One lowercase letter',
                            hasNumber: 'One number',
                            hasSpecial: 'One special character (!@#$%^&*)',
                            passwordsMatch: 'Passwords match'
                          }).map(([key, label]) => (
                            <div key={key} className="flex items-center text-sm">
                              <span className={`mr-2 ${passwordValidation[key] ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                {passwordValidation[key] ? '✓' : '○'}
                              </span>
                              <span className={passwordValidation[key] ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Notification Preferences</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                      Choose what notifications you want to receive
                    </p>

                    <div className="space-y-4">
                      {[
                        { key: 'email_notifications', title: 'Email Notifications', desc: 'Receive notifications via email' },
                        { key: 'task_updates', title: 'Task Updates', desc: 'Get notified when tasks are updated' },
                        { key: 'task_assignments', title: 'Task Assignments', desc: 'Get notified when assigned to tasks' },
                        { key: 'task_completions', title: 'Task Completions', desc: 'Get notified when tasks are completed' },
                        { key: 'weekly_summary', title: 'Weekly Summary', desc: 'Receive a weekly summary of your tasks' },
                        { key: 'task_reminders', title: 'Task Due Date Reminders', desc: 'Get reminded before tasks expire (24h before due date)' }
                      ].map((item, index, array) => (
                        <div key={item.key} className={`flex items-center justify-between py-3 ${index < array.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''} transition-colors`}>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white transition-colors">{item.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNotificationToggle(item.key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                              notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">Appearance</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white transition-colors">Dark Mode</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Toggle dark mode for better viewing at night</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDarkModeToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;