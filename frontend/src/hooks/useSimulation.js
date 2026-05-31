import { useEffect, useMemo, useState } from 'react';

function useSimulation(routeSummary, onComplete) {
  const [index, setIndex] = useState(0);

  const path = useMemo(() => {
    if (!routeSummary) return [];
    const firstLeg = routeSummary.routeToPatient || [];
    const secondLeg = routeSummary.routeToHospital ? routeSummary.routeToHospital.slice(1) : [];
    return [...firstLeg, ...secondLeg];
  }, [routeSummary]);

  useEffect(() => {
    setIndex(0);
  }, [path.length]);

  useEffect(() => {
    if (path.length === 0) return undefined;
    
    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current + 1 >= path.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 1200);
    
    return () => window.clearInterval(timer);
  }, [path]);

  // Trigger onComplete when index reaches the end of the path
  useEffect(() => {
    if (path.length > 0 && index === path.length - 1) {
      if (onComplete) onComplete();
    }
  }, [index, path.length, onComplete]);

  const currentLocation = path[index] || routeSummary?.ambulance?.location;
  const progress = `${Math.min(index + 1, path.length)}/${path.length || 1}`;
  const segment = routeSummary
    ? index < (routeSummary.routeToPatient?.length || 0)
      ? 'Heading to patient'
      : 'Transporting to hospital'
    : 'Waiting';

  return { currentLocation, progress, segment, path };
}

export default useSimulation;
