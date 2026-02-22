import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function AvatarUpload({ user, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.avatar || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setPreview(base64String);

        // Upload to backend
        await api.post(`/users/${user.id}/avatar`, {
          avatar: base64String
        });

        // Update local storage
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        toast.success('Avatar updated successfully!');
        onAvatarUpdate(base64String);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      await api.post(`/users/${user.id}/avatar`, { avatar: null });
      
      setPreview(null);
      const updatedUser = { ...user, avatar: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Avatar removed');
      onAvatarUpdate(null);
    } catch (error) {
      toast.error('Failed to remove avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-700 shadow-lg">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">
          {preview ? 'Change' : 'Upload'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {preview && (
          <button
            onClick={removeAvatar}
            disabled={uploading}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPG, PNG or GIF. Max 2MB.
      </p>
    </div>
  );
}

export default AvatarUpload;