
import React, { useState, useEffect } from "react";
import { RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const UpdateButton = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker update events
    const handleUpdateAvailable = () => {
      setIsUpdateAvailable(true);
      toast.info("Pembaruan tersedia!", {
        description: "Klik tombol update untuk menerapkan pembaruan terbaru."
      });
    };

    const handleUpdateComplete = () => {
      toast.success("Aplikasi telah diperbarui!", {
        description: "Semua pembaruan telah diterapkan."
      });
      setIsUpdateAvailable(false);
      setIsUpdating(false);
    };

    // Listen for custom events from service worker
    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-updated', handleUpdateComplete);

    // Auto-check for updates on component mount
    checkForUpdates();
    
    // Set up interval to check for updates every 10 minutes
    const interval = setInterval(checkForUpdates, 10 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-updated', handleUpdateComplete);
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.update();
        }
      }
    } catch (error) {
      console.log('Update check failed:', error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration && registration.waiting) {
          // Tell the waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Wait for the new service worker to take control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        } else {
          // Fallback: force refresh
          window.location.reload();
        }
      } else {
        // Fallback for browsers without service worker support
        window.location.reload();
      }
      
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
    toast.info("Memeriksa pembaruan...", {
      description: "Mencari pembaruan terbaru dari server."
    });
    
    checkForUpdates();
    
    setTimeout(() => {
      setIsUpdating(false);
      if (!isUpdateAvailable) {
        toast.success("Aplikasi sudah versi terbaru!", {
          description: "Tidak ada pembaruan yang tersedia saat ini."
        });
      }
    }, 2000);
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
          <span>{isUpdating ? "Memeriksa..." : "Periksa Update"}</span>
        </Button>
      )}
    </div>
  );
};
