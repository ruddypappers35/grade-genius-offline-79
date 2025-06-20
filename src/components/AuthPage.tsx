
import React, { useState } from 'react';
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleRegisterSuccess = () => {
    setIsLoginMode(true);
    alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
  };

  return (
    <>
      {isLoginMode ? (
        <LoginForm
          onLoginSuccess={onAuthSuccess}
          onSwitchToRegister={() => setIsLoginMode(false)}
        />
      ) : (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setIsLoginMode(true)}
        />
      )}
    </>
  );
};
