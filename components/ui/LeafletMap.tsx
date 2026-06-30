'use client'

import { useRef, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { gsap } from '@/lib/gsap'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GmbLocation } from '@/types/gmb'

// Disable Leaflet's default icon resolution (broken by bundlers). All markers use divIcon exclusively.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl

interface LeafletMapProps {
  locations: GmbLocation[]
  joinLabel: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150&auto=format&fit=crop'

function createPinIcon(num: string, isActive: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="ira-marker" data-num="${num}">
      <span class="ira-marker__ping${isActive ? ' ira-marker__ping--active' : ''}"></span>
      <div class="ira-marker__box${isActive ? ' ira-marker__box--active' : ''}">
        <span>${num}</span>
      </div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Zoom controls: must be inside MapContainer to access useMap()
function ZoomControls() {
  const map = useMap()
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col border border-white/20 shadow-lg overflow-hidden">
      <button
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 flex items-center justify-center bg-canvas/90 hover:bg-canvas text-inkBlack text-base leading-none transition-colors duration-150 border-b border-white/20"
      >
        +
      </button>
      <button
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 flex items-center justify-center bg-canvas/90 hover:bg-canvas text-inkBlack text-base leading-none transition-colors duration-150"
      >
        −
      </button>
    </div>
  )
}

// Inner component: runs inside MapContainer so useMap() works
function MapContent({
  locations,
  active,
  onSelect,
}: {
  locations: GmbLocation[]
  active: number
  onSelect: (idx: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!locations.length) return
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]))
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(bounds, {
        paddingTopLeft: [80, 30],
        paddingBottomRight: [120, 120],
        maxZoom: 6,
      })
    }
    map.whenReady(fit)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={18}
      />
      {locations.map((loc, idx) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={createPinIcon(String(idx + 1).padStart(2, '0'), idx === active)}
          eventHandlers={{ click: () => onSelect(idx) }}
        />
      ))}
    </>
  )
}

export default function LeafletMap({ locations, joinLabel }: LeafletMapProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const handleSelect = (idx: number) => {
    const el = cardRef.current
    if (!el) { setActive(idx); return }
    gsap.to(el, {
      opacity: 0, y: 8, duration: 0.15,
      onComplete: () => {
        setActive(idx)
        gsap.to(el, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
      },
    })
  }

  const loc = locations[active]
  const img = loc.imageUrl ?? FALLBACK_IMAGE

  return (
    <>
      <style>{`
        .ira-marker { position: relative; display: flex; align-items: center; justify-content: center; }
        .ira-marker__box {
          width: 24px; height: 24px;
          border: 1px solid rgba(255,255,255,0.9);
          background: #000;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s;
          position: relative; z-index: 1;
        }
        .ira-marker__box span { font-size: 9px; font-weight: 700; color: #fff; font-family: ui-monospace, monospace; }
        .ira-marker__box--active { background: #b89c72 !important; }
        .ira-marker__box:hover { transform: scale(1.1); }
        .ira-marker__ping {
          position: absolute; width: 24px; height: 24px;
          background: rgba(184,156,114,0.25); z-index: 0; display: none;
          animation: ira-ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
        }
        .ira-marker__ping--active { display: block; }
        @keyframes ira-ping {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-container { background: #1a1a1a !important; }
        .leaflet-marker-icon { cursor: pointer !important; }
      `}</style>

      <MapContainer
        center={[46.0, 1.0]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <MapContent locations={locations} active={active} onSelect={handleSelect} />
        <ZoomControls />
      </MapContainer>

      {/* Info card overlay */}
      <div
        ref={cardRef}
        className="absolute bottom-4 left-4 right-4 z-[1000] bg-canvas border border-borderLight p-4 shadow-2xl"
      >
        <div className="flex gap-4 items-center">
          <div
            className="w-16 h-16 flex-shrink-0 border border-borderLight bg-softGray"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(100%)',
            }}
          />
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-serif font-bold text-inkBlack text-sm truncate">{loc.title}</h4>
              {loc.category && (
                <span className="flex-shrink-0 border border-borderLight text-inkBlack text-[8px] uppercase tracking-widest px-2 py-0.5 font-semibold font-display">
                  {loc.category}
                </span>
              )}
            </div>
            <p className="text-[10px] text-grayText font-light line-clamp-2 font-sans leading-relaxed">
              {loc.description ?? loc.address}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-grayText uppercase tracking-wider font-display">📍 {loc.address}</span>
              <a href="#register" className="text-[9px] text-gold hover:underline tracking-wider font-semibold uppercase font-display">
                {joinLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
