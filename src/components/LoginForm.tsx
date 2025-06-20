
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !password) {
      alert('Mohon isi semua field');
      return;
    }

    setIsLoading(true);
    
    // Simulasi proses login
    setTimeout(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.fullName === fullName && userData.password === password) {
          localStorage.setItem('isLoggedIn', 'true');
          setIsLoading(false);
          onLoginSuccess();
        } else {
          setIsLoading(false);
          alert('Nama atau password salah');
        }
      } else {
        setIsLoading(false);
        alert('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Masuk</CardTitle>
          <CardDescription>Masuk ke akun Anda untuk menggunakan Sistem Nilai</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:underline font-medium"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Developed with <span className="text-lg">☕</span> by <span className="text-gray-900 font-medium">Rudy Susanto</span>
        </p>
      </footer>
    </div>
  );
};
