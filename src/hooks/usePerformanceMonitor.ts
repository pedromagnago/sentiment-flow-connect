import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string, threshold: number = 1000) => {
  const renderStart = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const start = renderStart.current;
    
    return () => {
      const duration = performance.now() - start;
      
      // Log detalhado
      console.log(`📊 ${componentName} - Render #${renderCount.current}: ${duration.toFixed(2)}ms`);
      
      // Alerta para renders lentos
      if (duration > threshold) {
        console.warn(`⚠️ SLOW RENDER: ${componentName} took ${duration.toFixed(2)}ms`);
        
        // Enviar para analytics (opcional)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'slow_render', {
            component: componentName,
            duration: duration,
            render_count: renderCount.current
          });
        }
      }
      
      // Resetar para próximo render
      renderStart.current = performance.now();
    };
  });

  return {
    renderCount: renderCount.current,
    reset: () => {
      renderCount.current = 0;
      renderStart.current = performance.now();
    }
  };
};
