import { useMemo, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair } from 'lucide-react';

function MapTracker({ position, active, follow }) {
  const map = useMap();
  useEffect(() => {
    if (active && follow && position && Array.isArray(position) && position.length === 2) {
      map.panTo(position, { animate: true, duration: 0.8 });
    }
  }, [position, active, follow, map]);
  return null;
}

function MapClickSelector({ nodes, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      let nearest = null;
      let minDistance = Infinity;
      nodes.forEach((node) => {
        const [nodeLat, nodeLng] = node.position;
        const dist = Math.sqrt(Math.pow(nodeLat - lat, 2) + Math.pow(nodeLng - lng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearest = node.id;
        }
      });
      onLocationSelect({ id: nearest, lat, lon: lng });
    },
  });
  return null;
}

function Map({ mapData, ambulances, routeToPatient, routeToHospital, ambulance, patientLocation, hospitalLocation, currentLocation, selectedLocation, onLocationSelect }) {
  const [isFollowMode, setIsFollowMode] = useState(true);
  
  const nodes = useMemo(() => mapData?.nodes || [], [mapData]);
  const edges = useMemo(() => mapData?.edges || [], [mapData]);
  
  const positionMap = useMemo(() => 
    Object.fromEntries(nodes.map((node) => [node.id, node.position])),
    [nodes]
  );

  const mapCenter = [24.86, 67.01];

  const edgeLines = useMemo(() => 
    edges
      .map(([from, to]) => {
        const source = positionMap[from];
        const dest = positionMap[to];
        return source && dest ? [source, dest] : null;
      })
      .filter(Boolean),
    [edges, positionMap]
  );

  const patientRoute = useMemo(() => 
    (routeToPatient || []).map((nodeId) => positionMap[nodeId]).filter(Boolean),
    [routeToPatient, positionMap]
  );
  
  const hospitalRoute = useMemo(() => 
    (routeToHospital || []).map((nodeId) => positionMap[nodeId]).filter(Boolean),
    [routeToHospital, positionMap]
  );

  const assignedAmbulancePosition = useMemo(() => {
    if (currentLocation && positionMap[currentLocation]) return positionMap[currentLocation];
    if (ambulance?.location && positionMap[ambulance.location]) return positionMap[ambulance.location];
    return null;
  }, [currentLocation, ambulance?.location, positionMap]);

  return (
    <div className="h-full relative group font-sans">
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl px-4 py-2 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${ambulance ? 'bg-rose-500 animate-ping' : 'bg-cyan-600 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
              {ambulance ? `Tracking ${ambulance.name}` : 'Ready for Dispatch'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => setIsFollowMode(!isFollowMode)}
          className={`p-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
            isFollowMode 
              ? 'bg-cyan-500 border-cyan-400 text-white' 
              : 'bg-white/95 border-slate-200 text-slate-600 hover:bg-white'
          }`}
        >
          <Crosshair className={`w-5 h-5 ${isFollowMode ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        className="h-[600px] w-full"
        zoomControl={true}
        dragging={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapTracker position={assignedAmbulancePosition} active={!!ambulance} follow={isFollowMode} />
        <MapClickSelector nodes={nodes} onLocationSelect={onLocationSelect} />

        {edgeLines.map((line, index) => (
          <Polyline key={`road-${index}`} positions={line} color="#cbd5e1" weight={2} opacity={0.4} />
        ))}

        {patientRoute.length > 1 && (
          <Polyline positions={patientRoute} pathOptions={{ color: '#0891b2', weight: 5, opacity: 0.9, dashArray: '10, 10' }} />
        )}
        
        {hospitalRoute.length > 1 && (
          <Polyline positions={hospitalRoute} pathOptions={{ color: '#059669', weight: 5, opacity: 0.9 }} />
        )}

        {selectedLocation?.lat && (
          <CircleMarker
            center={[selectedLocation.lat, selectedLocation.lon]}
            radius={12}
            pathOptions={{ color: '#0891b2', fillColor: '#0891b2', fillOpacity: 0.3, weight: 2, dashArray: '3, 6' }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
               <div className="px-2 py-1 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">Target Point</div>
            </Tooltip>
          </CircleMarker>
        )}

        {nodes.map((node) => {
          const isHospital = node.id === hospitalLocation;
          const isPatient = node.id === patientLocation;
          const isSelected = node.id === selectedLocation?.id;
          
          let color = '#94a3b8';
          let fillColor = '#ffffff';
          let radius = 5;

          if (isPatient) { color = '#0891b2'; fillColor = '#0891b2'; radius = 9; }
          else if (isHospital) { color = '#059669'; fillColor = '#059669'; radius = 9; }
          else if (isSelected) { color = '#0891b2'; fillColor = '#ffffff'; radius = 8; }

          return (
            <CircleMarker
              key={node.id}
              center={node.position}
              radius={radius}
              pathOptions={{ color, fillColor, fillOpacity: 1, weight: (isPatient || isHospital) ? 4 : 1 }}
              eventHandlers={{ click: () => { onLocationSelect({ id: node.id, lat: node.position[0], lon: node.position[1] }); } }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} className="custom-tooltip">
                <div className="px-2 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 shadow-xl">{node.label}</div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {(ambulances || []).map((amb) => {
          const isAssigned = ambulance?.id === amb.id;
          const position = isAssigned && assignedAmbulancePosition ? assignedAmbulancePosition : positionMap[amb.location];
          if (!position) return null;
          return (
            <CircleMarker
              key={amb.id}
              center={position}
              radius={9}
              pathOptions={{ color: '#ffffff', fillColor: amb.status === 'available' ? '#10b981' : '#f43f5e', fillOpacity: 1, weight: isAssigned ? 5 : 2 }}
            >
              <Tooltip permanent={isAssigned} direction="right" offset={[15, 0]} opacity={1} className="ambulance-tooltip">
                <div className={`px-2 py-1 ${amb.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'} text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl border-2 border-white font-sans`}>{amb.name}</div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="p-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter font-sans">Patient Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter font-sans">Hospital Transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;
