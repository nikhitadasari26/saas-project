import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UpgradeModal = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { tenant, refreshTenantData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/tenants/request-upgrade', { plan: selectedPlan });
      alert('Upgrade request submitted successfully!');
      refreshTenantData();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold mb-4">Request Plan Upgrade</h2>
        <p className="mb-6 text-gray-600">
          Your current plan is <span className="font-bold capitalize">{tenant.subscription_plan}</span>.
          Select a new plan to request an upgrade.
        </p>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="plan-select" className="block text-sm font-bold text-gray-700 mb-2">
              New Plan
            </label>
            <select
              id="plan-select"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpgradeModal;
