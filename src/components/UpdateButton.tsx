
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
        description: "Aplikasi akan diperbarui secara otomatis."
      });
      
      // Auto-update after 2 seconds
      setTimeout(() => {
        handleUpdate();
      }, 2000);
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
    
    // Set up interval to check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30 * 1000);
    
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
          await registration.update();
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
        
        if (registration) {
          // Force update by clearing cache and updating
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          } else {
            registration.waiting?.postMessage({ type: 'FORCE_UPDATE' });
            await registration.update();
          }
          
          // Wait a bit then reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
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
        description: "Memuat ulang halaman..."
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleManualRefresh = () => {
    setIsUpdating(true);
    toast.info("Memeriksa pembaruan...", {
      description: "Mencari pembaruan terbaru dari server."
    });
    
    // Clear cache and force reload
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        window.location.reload();
      });
    } else {
      checkForUpdates();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
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
          <span>{isUpdating ? "Memperbarui..." : "Update Otomatis"}</span>
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
          <span>{isUpdating ? "Memperbarui..." : "Refresh App"}</span>
        </Button>
      )}
    </div>
  );
};
