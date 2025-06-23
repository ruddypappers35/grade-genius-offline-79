
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus } from "lucide-react";

interface RegistrationData {
  username: string;
  fullName: string;
  institution: string;
  npsn: string;
  password: string;
  confirmPassword: string;
}

interface RegistrationFormProps {
  onRegistrationSuccess: () => void;
}

export const RegistrationForm = ({ onRegistrationSuccess }: RegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegistrationData>({
    defaultValues: {
      username: "",
      fullName: "",
      institution: "",
      npsn: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegistrationData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama!");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setIsLoading(true);

    try {
      // Simpan data ke localStorage
      const userData = {
        username: data.username,
        fullName: data.fullName,
        institution: data.institution,
        npsn: data.npsn,
        password: data.password, // In production, this should be hashed
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem('registeredUser', JSON.stringify(userData));
      localStorage.setItem('isRegistered', 'true');

      // Kirim email notification ke rudyfisika@gmail.com
      await sendRegistrationEmail(data);

      toast.success("Pendaftaran berhasil!", {
        description: "Silakan login dengan username dan password Anda."
      });

      onRegistrationSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Gagal mendaftar", {
        description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendRegistrationEmail = async (data: RegistrationData) => {
    const emailData = {
      to: 'rudyfisika@gmail.com',
      subject: 'Pendaftaran Baru - Sumatif App',
      message: `
        Pendaftaran baru telah dilakukan:
        
        Username: ${data.username}
        Nama Lengkap: ${data.fullName}
        Nama Instansi: ${data.institution}
        NPSN: ${data.npsn}
        Waktu Daftar: ${new Date().toLocaleString('id-ID')}
      `
    };

    console.log('Registration data sent to rudyfisika@gmail.com:', emailData);
    // In a real application, this would send to an actual email service
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sumatif App</h1>
          <p className="text-gray-600 text-sm mt-1">Sistem Manajemen Nilai Siswa</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Pendaftaran Aplikasi
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Daftar untuk menggunakan Aplikasi
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
                  name="fullName"
                  rules={{ required: "Nama lengkap wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nama lengkap" 
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
                  name="institution"
                  rules={{ required: "Nama instansi wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Instansi</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nama instansi" 
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
                  name="npsn"
                  rules={{ required: "NPSN wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPSN</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan NPSN" 
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
                  rules={{ 
                    required: "Password wajib diisi",
                    minLength: { value: 6, message: "Password minimal 6 karakter" }
                  }}
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  rules={{ required: "Konfirmasi password wajib diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Konfirmasi password" 
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
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
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Mendaftar..." : "Daftar"}
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
