
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { RegistrationForm } from "@/components/RegistrationForm";
import { LoginForm } from "@/components/LoginForm";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { isRegistered, isLoggedIn, register, login } = useAuth();

  // Show registration form if not registered
  if (!isRegistered) {
    return (
      <RegistrationForm 
        onRegistrationSuccess={() => {
          register();
        }} 
      />
    );
  }

  // Show login form if registered but not logged in
  if (!isLoggedIn) {
    return (
      <LoginForm 
        onLoginSuccess={(userData) => {
          login(userData);
        }} 
      />
    );
  }

  // Show main app if logged in
  return <>{children}</>;
};
