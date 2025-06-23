
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Enhanced service worker registration for real-time updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Force immediate update check
        registration.update();
        
        // Check for updates more frequently (every 30 seconds)
        setInterval(() => {
          registration.update();
        }, 30 * 1000);
        
        // Listen for updates and force reload
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New version available - force update
                  console.log('New version available, updating...');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                } else {
                  // First install
                  console.log('App is ready for offline use');
                }
              }
            });
          }
        });
        
        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New service worker activated, reloading...');
          window.location.reload();
        });
        
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_ACTIVATED' && event.data.action === 'RELOAD') {
        console.log('Service worker activated, reloading page...');
        window.location.reload();
      }
      
      if (event.data && event.data.type === 'SW_UPDATED') {
        window.dispatchEvent(new CustomEvent('sw-updated'));
      }
    });
    
    // Force update check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update();
          }
        });
      }
    });
    
    // Force update when online
    window.addEventListener('online', () => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    });
  });
}
