import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    subdomain: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // Mapping frontend state to EXACT backend expected keys
      const res = await api.post('/auth/register-tenant', {
        organizationName: formData.organizationName, // Matches backend
        subdomain: formData.subdomain,              // Matches backend
        email: formData.email,                      // WAS adminEmail, NOW email
        fullName: formData.fullName,                // WAS adminName, NOW fullName
        password: formData.password                 // Matches backend
      });

      if (res.data.success) {
        alert("Registration successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      // This will now show the actual message like "Subdomain already taken"
      setError(err.response?.data?.message || "Registration failed. Check backend terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Register Organization</h2>
        <p className="text-gray-500 text-center mb-8">Start your multi-tenant journey today</p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5"> {/* Professional vertical spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Organization</label>
              <input 
                type="text" placeholder="TechCorp" required
                className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subdomain</label>
              <input 
                type="text" placeholder="techcorp" required
                className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
              />
            </div>
          </div>

          <div className="border-t pt-5 mt-5">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Admin Full Name</label>
            <input 
              type="text" placeholder="John Doe" required
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Admin Email</label>
            <input 
              type="email" placeholder="admin@techcorp.com" required
              className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input 
                type="password" placeholder="••••••••" required
                className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm</label>
              <input 
                type="password" placeholder="••••••••" required
                className="w-full border-2 border-gray-100 p-3 rounded-lg focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all mt-4 ${
              loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
            }`}
          >
            {loading ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;