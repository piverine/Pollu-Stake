'use client'

import { useState, useEffect, useCallback } from 'react'
import { Cloud, MapPin, RefreshCw, AlertTriangle, CheckCircle, Info, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface CityAQI {
    name: string
    latitude: number
    longitude: number
    uid?: number // WAQI station UID
    aqi?: number
    pollution?: {
        pm10?: number
        pm2_5?: number
        o3?: number
        no2?: number
    }
    status?: string
    loading: boolean
    error?: string
}

const INITIAL_CITIES = [
    { name: 'Delhi', latitude: 28.61, longitude: 77.20 },
    { name: 'Mumbai', latitude: 19.07, longitude: 72.87 },
    { name: 'New York', latitude: 40.71, longitude: -74.00 },
    { name: 'London', latitude: 51.50, longitude: -0.12 },
    { name: 'Tokyo', latitude: 35.68, longitude: 139.69 },
    { name: 'Beijing', latitude: 39.90, longitude: 116.40 },
]

export default function AQIPage() {
    const [cities, setCities] = useState<CityAQI[]>(
        INITIAL_CITIES.map((c) => ({ ...c, loading: true }))
    )
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    // Use the token from env or fallback to the one provided during chat if needed for testing (though env should work)
    const WAQI_TOKEN = process.env.NEXT_PUBLIC_WAQI_TOKEN

    const fetchAQIForCity = async (city: CityAQI): Promise<CityAQI> => {
        if (!WAQI_TOKEN) {
            return { ...city, loading: false, error: 'API Token missing' }
        }

        try {
            // Prioritize UID if available (from search), otherwise use name or geo
            let url = `https://api.waqi.info/feed/${city.name}/?token=${WAQI_TOKEN}`

            if (city.uid) {
                url = `https://api.waqi.info/feed/@${city.uid}/?token=${WAQI_TOKEN}`
            } else if (city.latitude && city.longitude && !INITIAL_CITIES.find(c => c.name === city.name)) {
                // Fallback to geo for non-standard names if needed, but 'feed/name' is robust for major cities
                // For search results, we'll try to get UID.
                url = `https://api.waqi.info/feed/geo:${city.latitude};${city.longitude}/?token=${WAQI_TOKEN}`
            }

            const response = await fetch(url)
            const data = await response.json()

            if (data.status !== 'ok') {
                throw new Error(data.data || 'Unknown error')
            }

            const result = data.data
            const aqi = parseInt(result.aqi, 10)

            let status = 'Good'
            if (aqi > 50) status = 'Moderate'
            if (aqi > 100) status = 'Unhealthy for Sensitive Groups'
            if (aqi > 150) status = 'Unhealthy'
            if (aqi > 200) status = 'Very Unhealthy'
            if (aqi > 300) status = 'Hazardous'

            return {
                ...city,
                aqi: isNaN(aqi) ? undefined : aqi,
                pollution: {
                    pm10: result.iaqi?.pm10?.v,
                    pm2_5: result.iaqi?.pm25?.v,
                    o3: result.iaqi?.o3?.v,
                    no2: result.iaqi?.no2?.v,
                },
                // Update name/geo if we have better info from API? Maybe keep original to avoid jumping.
                // But for initial cities, 'Delhi' is fine.
                status,
                loading: false,
                error: undefined,
            }
        } catch (error) {
            console.error(`Failed to fetch AQI for ${city.name}`, error)
            return { ...city, loading: false, error: 'Failed to fetch data' }
        }
    }

    const updateAQIData = async (cityList: CityAQI[]) => {
        const updated = await Promise.all(cityList.map(fetchAQIForCity))
        setCities(updated)
        setLastUpdated(new Date())
    }

    // Initial load
    useEffect(() => {
        updateAQIData(INITIAL_CITIES.map(c => ({ ...c, loading: true })))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRefresh = () => {
        setCities(prev => prev.map(c => ({ ...c, loading: true })))
        updateAQIData(cities)
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        if (!WAQI_TOKEN) {
            toast.error('API Token missing')
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://api.waqi.info/search/?keyword=${encodeURIComponent(searchQuery)}&token=${WAQI_TOKEN}`
            )
            const data = await response.json()

            if (data.status !== 'ok' || !data.data || data.data.length === 0) {
                toast.error('City not found')
                setIsSearching(false)
                return
            }

            // Pick the best result (usually the first one)
            const station = data.data[0]
            const newCityName = station.station.name.split(',')[0] // Simplify name if too long

            // Check duplicate by name or UID
            if (cities.some(c => c.uid === station.uid || c.name.toLowerCase().includes(newCityName.toLowerCase()))) {
                toast.error('City already added')
                setIsSearching(false)
                return
            }

            const newCityBase: CityAQI = {
                name: newCityName,
                latitude: station.station.geo[0],
                longitude: station.station.geo[1],
                uid: station.uid,
                loading: true
            }

            // Fetch full details for the new city
            const cityWithAQI = await fetchAQIForCity(newCityBase)

            setCities(prev => [cityWithAQI, ...prev])
            setSearchQuery('')
            toast.success(`Added ${newCityName}`)

        } catch (error) {
            console.error('Search error:', error)
            toast.error('Failed to search city')
        } finally {
            setIsSearching(false)
        }
    }

    const getStatusColor = (aqi?: number) => {
        if (aqi === undefined) return 'bg-gray-100 text-gray-800'
        if (aqi <= 50) return 'bg-green-100 text-green-800 border-green-200'
        if (aqi <= 100) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        if (aqi <= 150) return 'bg-orange-100 text-orange-800 border-orange-200'
        if (aqi <= 200) return 'bg-red-100 text-red-800 border-red-200'
        if (aqi <= 300) return 'bg-purple-100 text-purple-800 border-purple-200'
        return 'bg-rose-900 text-rose-100 border-rose-800'
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal-900">Global Air Quality</h1>
                    <p className="mt-2 text-charcoal-600">
                        Real-time Air Quality Index (US AQI) monitoring using ground-station data.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-charcoal-500">
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <Button onClick={handleRefresh} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex max-w-md gap-2">
                <Input
                    placeholder="Search city (e.g., Paris, Delhi)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching} isLoading={isSearching}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cities.map((city) => (
                    <div
                        key={city.name + (city.uid || '')}
                        className="group relative overflow-hidden rounded-2xl border border-charcoal-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-charcoal-900 line-clamp-1" title={city.name}>{city.name}</h3>
                                    <p className="text-xs text-charcoal-500">
                                        {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                                    </p>
                                </div>
                            </div>
                            {city.loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-charcoal-200 border-t-charcoal-600" />
                            ) : (
                                <div
                                    className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                        city.aqi
                                    )}`}
                                >
                                    {city.aqi !== undefined && city.aqi <= 50 ? (
                                        <CheckCircle className="h-3 w-3" />
                                    ) : (
                                        <AlertTriangle className="h-3 w-3" />
                                    )}
                                    {city.status}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-charcoal-900">
                                    {city.aqi ?? '--'}
                                </span>
                                <span className="mb-1 text-sm font-medium text-charcoal-500">US AQI</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-charcoal-50 p-4">
                                <div>
                                    <div className="flex items-center gap-1 text-xs text-charcoal-500">
                                        <Cloud className="h-3 w-3" />
                                        PM2.5
                                    </div>
                                    <div className="mt-1 text-lg font-semibold text-charcoal-900">
                                        {city.pollution?.pm2_5 ?? '--'}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-xs text-charcoal-500">
                                        <Cloud className="h-3 w-3" />
                                        PM10
                                    </div>
                                    <div className="mt-1 text-lg font-semibold text-charcoal-900">
                                        {city.pollution?.pm10 ?? '--'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-xl bg-blue-50 p-6">
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-900">About Air Quality Index (AQI)</h4>
                        <p className="mt-1 text-sm text-blue-700">
                            The AQI is based on the measurement of particulate matter (PM2.5 and PM10), Ozone (O3), Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2) and Carbon Monoxide emissions.
                            An AQI under 50 is considered good, while anything over 150 is considered unhealthy for everyone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
