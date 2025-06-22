
import React, { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const UpdateButton = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check for updates when component mounts
    checkForUpdates();
    
    // Set up interval to check for updates every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // Simple cache-busting check by comparing current timestamp with cached version
      const currentVersion = localStorage.getItem('app_version');
      const serverVersion = Date.now().toString();
      
      if (currentVersion && currentVersion !== serverVersion) {
        setIsUpdateAvailable(true);
      }
      
      // Store current version for next check
      if (!currentVersion) {
        localStorage.setItem('app_version', serverVersion);
      }
    } catch (error) {
      console.log('Update check failed:', error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Clear all caches
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Clear application cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage version to force refresh
      localStorage.removeItem('app_version');
      
      // Show success message
      toast.success("Aplikasi berhasil diperbarui!", {
        description: "Halaman akan dimuat ulang untuk menerapkan pembaruan."
      });
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Update failed:', error);
      toast.error("Gagal memperbarui aplikasi", {
        description: "Silakan coba lagi atau muat ulang halaman secara manual."
      });
      setIsUpdating(false);
    }
  };

  const handleManualRefresh = () => {
    setIsUpdating(true);
    toast.info("Memuat ulang aplikasi...", {
      description: "Memeriksa pembaruan terbaru."
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="flex items-center space-x-2">
      {isUpdateAvailable ? (
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-2"
        >
          {isUpdating ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{isUpdating ? "Memperbarui..." : "Update Tersedia"}</span>
        </Button>
      ) : (
        <Button
          onClick={handleManualRefresh}
          disabled={isUpdating}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {isUpdating ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          <span>{isUpdating ? "Memuat..." : "Periksa Update"}</span>
        </Button>
      )}
    </div>
  );
};
