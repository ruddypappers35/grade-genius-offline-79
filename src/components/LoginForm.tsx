
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";

interface LoginData {
  username: string;
  password: string;
}

interface LoginFormProps {
  onLoginSuccess: (userData: any) => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);

    try {
      const registeredUser = localStorage.getItem('registeredUser');
      
      if (!registeredUser) {
        toast.error("Pengguna tidak ditemukan!", {
          description: "Silakan daftar terlebih dahulu."
        });
        return;
      }

      const userData = JSON.parse(registeredUser);
      
      if (userData.username === data.username && userData.password === data.password) {
        // Login berhasil
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: userData.username,
          fullName: userData.fullName,
          institution: userData.institution,
          loginAt: new Date().toISOString()
        }));

        toast.success("Login berhasil!", {
          description: `Selamat datang, ${userData.fullName}!`
        });

        onLoginSuccess(userData);
      } else {
        toast.error("Login gagal!", {
          description: "Username atau password salah."
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Terjadi kesalahan", {
        description: "Silakan coba lagi."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">SUMATIF APP</h1>
          <p className="text-gray-600 text-sm mt-1">Sistem Manajemen Nilai Siswa</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Login
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Masuk ke akun Anda
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  rules={{ required: "Username wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan username" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{ required: "Password wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password" 
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Masuk..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto p-4 border-t border-gray-200 text-center bg-white">
        <p className="text-gray-600 text-sm">
          Developed with <span className="text-lg">☕</span> by{" "}
          <a 
            href="https://rdsusanto.my.id" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 font-bold hover:text-blue-800 hover:underline"
          >
            Rudy Susanto
          </a>
        </p>
      </footer>
    </div>
  );
};
