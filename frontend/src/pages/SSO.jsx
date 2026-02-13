import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SSO = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Validate token and get user data
            // We temporarily set the token to make the API call work
            localStorage.setItem('token', token);

            api.get('/auth/me')
                .then(res => {
                    const user = res.data.data;
                    login(user, token);
                    navigate('/dashboard', { replace: true });
                })
                .catch(err => {
                    console.error("SSO Failed", err);
                    navigate('/login', { replace: true });
                });
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700">Redirecting to your workspace...</h2>
            </div>
        </div>
    );
};

export default SSO;
