import { useEffect, useRef, useState } from "react"
import { Place } from "@/types/place"

interface MapProps {
  places: Place[]
  onPlaceSelect?: (place: Place) => void
  onMapClick?: (lat: number, lng: number) => void
  center?: { lat: number; lng: number }
  level?: number
  className?: string
}

export function Map({ 
  places, 
  onPlaceSelect, 
  onMapClick,
  center,
  level = 3,
  className = "w-full h-full"
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Determine initial center position
    let initialCenter
    if (places.length > 0 && places[0].lat && places[0].lon) {
      // Use first place's coordinates if available
      initialCenter = new window.kakao.maps.LatLng(places[0].lat, places[0].lon)
    } else if (center) {
      // Use provided center if no places
      initialCenter = new window.kakao.maps.LatLng(center.lat, center.lng)
    } else {
      // Default to Jeju City Hall
      initialCenter = new window.kakao.maps.LatLng(33.4996213, 126.5311884)
    }

    const options = {
      center: initialCenter,
      level: level
    }

    const newMap = new window.kakao.maps.Map(mapRef.current, options)
    setMap(newMap)

    // Add click event listener
    window.kakao.maps.event.addListener(newMap, 'click', function(mouseEvent: any) {
      const latlng = mouseEvent.latLng
      onMapClick?.(latlng.getLat(), latlng.getLng())
    })

    return () => {
      // Cleanup markers when component unmounts
      markers.forEach(marker => {
        if (marker.marker) {
          marker.marker.setMap(null)
        }
        if (marker.overlay) {
          marker.overlay.setMap(null)
        }
      })
    }
  }, [places, center]) // Add places and center as dependencies

  // Update markers when places change
  useEffect(() => {
    if (!map) return

    console.log('Updating markers for places:', places)

    // Remove existing markers
    markers.forEach(marker => {
      if (marker.marker) {
        marker.marker.setMap(null)
      }
      if (marker.overlay) {
        marker.overlay.setMap(null)
      }
    })

    const newMarkers: any[] = []

    // Create new markers for each place
    places.forEach(place => {
      if (!place.lat || !place.lon) {
        console.warn('Place missing coordinates:', place)
        return
      }

      console.log('Creating marker for place:', place.title, 'at', place.lat, place.lon)

      const position = new window.kakao.maps.LatLng(place.lat, place.lon)
      
      // Create marker
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map
      })

      // Create custom overlay for marker
      const overlayContent = document.createElement('div')
      overlayContent.className = 'bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium mb-4'
      overlayContent.textContent = place.title

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: overlayContent,
        zIndex: 3,
        yAnchor: 1.5
      })

      // Add click event listener to marker
      window.kakao.maps.event.addListener(marker, 'click', function() {
        // Remove all existing overlays
        newMarkers.forEach(m => {
          if (m.overlay) {
            m.overlay.setMap(null)
          }
        })

        // Move map center to marker position
        map.setCenter(position)
        map.setLevel(level)
        
        // Show overlay
        overlay.setMap(map)
        
        // Call onPlaceSelect callback
        onPlaceSelect?.(place)
      })

      newMarkers.push({ marker, overlay })
    })

    console.log('Created markers:', newMarkers.length)
    setMarkers(newMarkers)
  }, [map, places, level])

  // Update map center when center prop changes
  useEffect(() => {
    if (!map || !center) return
    const position = new window.kakao.maps.LatLng(center.lat, center.lng)
    map.setCenter(position)
  }, [map, center])

  return <div ref={mapRef} className={className} />
} 