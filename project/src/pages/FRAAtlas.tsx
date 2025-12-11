import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import { Search, Layers, Filter, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L, { Map as LeafletMap } from 'leaflet';
import { sampleGeoData, sampleDistrictBoundaries, indiaBounds, stateBoundaries } from '../data/geoData';
import { getStateBoundary } from '../lib/geo/stateBoundaries';

const { BaseLayer, Overlay } = LayersControl;

const FRAAtlas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [filteredDistrictFC, setFilteredDistrictFC] = useState<any>(sampleDistrictBoundaries);
  const [filteredLayers, setFilteredLayers] = useState<any>(sampleGeoData);
  const [layersVersion, setLayersVersion] = useState(0);
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const mapRef = useRef<LeafletMap | null>(null);
  const [externalBoundary, setExternalBoundary] = useState<any | null>(null);

  const states = ['Odisha', 'Jharkhand', 'Telangana', 'Madhya Pradesh'];
  // Try to load precise boundary GeoJSON from public folder if available
  useEffect(() => {
    const load = async () => {
      setExternalBoundary(null);
      if (!selectedState) return;
      // Prefer accurate ADM1 boundary first (for Odisha and others)
      try {
        const adm1 = await getStateBoundary(selectedState);
        if (adm1) setExternalBoundary(adm1);
      } catch {}
      // Optionally override with a precise local file if provided
      const filename = selectedState.toLowerCase().replace(/\s+/g, '-') + '.geojson';
      try {
        const res = await fetch(`/boundaries/${filename}`);
        if (res.ok) {
          const gj = await res.json();
          setExternalBoundary(gj);
        }
      } catch {}
    };
    load();
  }, [selectedState]);

  // All districts by state
  const stateDistricts = useMemo(() => ({
    'Odisha': [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
      'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur',
      'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha',
      'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
      'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
    ],
    'Jharkhand': [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa',
      'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
      'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj',
      'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
    ],
    'Chhattisgarh': [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur',
      'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur',
      'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli',
      'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja',
      'Balrampur-Ramanujganj', 'Gaurela-Pendra-Marwahi', 'Manendragarh-Chirmiri-Bharatpur',
      'Mohla-Manpur-Ambagarh Chowki', 'Sarangarh-Bilaigarh', 'Shakti'
    ],
    'Madhya Pradesh': [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
      'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh',
      'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad',
      'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla',
      'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh',
      'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur',
      'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria',
      'Vidisha', 'Agar Malwa', 'Singrauli', 'Niwari'
    ],
    'Maharashtra': [
      'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana',
      'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna',
      'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
      'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
      'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
      'Washim', 'Yavatmal'
    ]
  }), []);

  const districts = useMemo(() => {
    return selectedState ? (stateDistricts[selectedState as keyof typeof stateDistricts] || []) : [];
  }, [selectedState, stateDistricts]);

  // Reset district when state changes
  useEffect(() => {
    setSelectedDistrict('');
  }, [selectedState]);

  // Real-time search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedState, selectedDistrict]);

  const applyFilters = () => {
    // Default view: fit to India when nothing selected
    if (!selectedState && mapRef.current) {
      const b = L.latLngBounds(indiaBounds[0] as any, indiaBounds[1] as any);
      mapRef.current.fitBounds(b, { padding: [24, 24] });
    }

    // Filter district boundaries by state and optional district
    const filteredDistrictFeatures = sampleDistrictBoundaries.features.filter((f: any) => {
      const isStateMatch = selectedState ? f.properties.state === selectedState : true;
      const isDistrictMatch = selectedDistrict ? f.properties.name === selectedDistrict : true;
      return isStateMatch && isDistrictMatch;
    });

    const newDistrictFC = { type: 'FeatureCollection', features: filteredDistrictFeatures } as any;
    setFilteredDistrictFC(newDistrictFC);

    // Filter thematic layers to features that fall within selected district(s) bounds if any
    const districtBounds = filteredDistrictFeatures.length
      ? L.geoJSON(newDistrictFC as any).getBounds()
      : null;

    // If no district selected, but a state is selected, use state bounds for clipping
    const stateBoundary = selectedState ? ((externalBoundary || stateBoundaries[selectedState as keyof typeof stateBoundaries]) as any) : null;
    const stateBounds = (!districtBounds && stateBoundary) ? L.geoJSON(stateBoundary).getBounds() : null;

    const filterByBounds = (fc: any) => {
      // Clip by district bounds first, else by state bounds if available
      if (!districtBounds && !stateBounds) return fc; // no filter -> keep all
      const filtered = fc.features.filter((feat: any) => {
        const layer = L.geoJSON(feat as any);
        const bounds = layer.getBounds();
        if (!bounds.isValid()) return false;
        if (districtBounds) return districtBounds.intersects(bounds);
        if (stateBounds) return stateBounds.intersects(bounds);
        return true;
      });
      return { type: 'FeatureCollection', features: filtered } as any;
    };

    // Apply search filter to features
    const filterBySearch = (fc: any) => {
      if (!searchTerm.trim()) return fc; // no search term -> keep all
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = fc.features.filter((feat: any) => {
        const props = feat.properties || {};
        // Search in name, tribe, village, and other relevant properties
        const searchableText = [
          props.name,
          props.tribe,
          props.village,
          props.claimantName,
          props.forestType,
          props.cropType,
          props.type
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
      return { type: 'FeatureCollection', features: filtered } as any;
    };

    // Apply both bounds and search filters
    const applyAllFilters = (fc: any) => {
      let filtered = filterByBounds(fc);
      filtered = filterBySearch(filtered);
      return filtered;
    };

    const newLayers = {
      fraLand: applyAllFilters(sampleGeoData.fraLand),
      forest: applyAllFilters(sampleGeoData.forest),
      farmland: applyAllFilters(sampleGeoData.farmland),
      water: applyAllFilters(sampleGeoData.water),
      villages: applyAllFilters(sampleGeoData.villages),
    } as any;
    setFilteredLayers(newLayers);
    setLayersVersion((v) => v + 1);

    // Update search results count
    const totalResults = Object.values(newLayers).reduce((sum: number, layer: any) => {
      return sum + (layer.features?.length || 0);
    }, 0);
    setSearchResultsCount(totalResults);

    // Fit map: first to district if selected, else to state (Odisha), else to search
    if (districtBounds && districtBounds.isValid()) {
      mapRef.current?.fitBounds(districtBounds, { padding: [24, 24] });
    } else if (selectedState) {
      const boundary = externalBoundary || stateBoundaries[selectedState as keyof typeof stateBoundaries];
      const stateBounds = boundary ? L.geoJSON(boundary as any).getBounds() : null;
      if (stateBounds && stateBounds.isValid()) mapRef.current?.fitBounds(stateBounds, { padding: [24, 24] });
    } else if (searchTerm.trim()) {
      // If searching without district filter, fit to search results
      const allSearchResults = [
        ...newLayers.fraLand.features,
        ...newLayers.forest.features,
        ...newLayers.farmland.features,
        ...newLayers.water.features,
        ...newLayers.villages.features
      ];
      if (allSearchResults.length > 0) {
        const searchBounds = L.geoJSON({ type: 'FeatureCollection', features: allSearchResults } as any).getBounds();
        if (searchBounds.isValid()) {
          mapRef.current?.fitBounds(searchBounds, { padding: [24, 24] });
        }
      }
    }
  };

  const layerStyles = {
    fraLand: { color: '#10B981', weight: 2, fillOpacity: 0.3 },
    forest: { color: '#059669', weight: 2, fillOpacity: 0.4 },
    farmland: { color: '#D97706', weight: 2, fillOpacity: 0.3 },
    water: { color: '#3B82F6', weight: 2, fillOpacity: 0.5 },
    villages: { color: '#7C2D12', weight: 2, fillOpacity: 0.2 },
  };

  const MapRefSetter = ({ onMap }: { onMap: (map: LeafletMap) => void }) => {
    const map = useMap();
    useEffect(() => {
      onMap(map);
    }, [map, onMap]);
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Layers className="h-8 w-8 text-green-600 mr-3" />
            Van Adhikaar - WebGIS Portal
          </h1>
          <p className="text-lg text-gray-600">
            Interactive mapping system for Forest Rights Act implementation and monitoring
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search villages, tribes, forests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-20 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {searchTerm && (
                <>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-12 top-2 h-6 w-6 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute right-3 top-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {searchResultsCount} results
                  </div>
                </>
              )}
            </div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <button onClick={applyFilters} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative z-10">
          <div className="h-96 md:h-[600px] relative z-10">
            <MapContainer
              center={[22.5, 79]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              <MapRefSetter onMap={(m: LeafletMap) => { mapRef.current = m; }} />
              <LayersControl position="topright">
                <BaseLayer checked name="OpenStreetMap">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                </BaseLayer>
                <BaseLayer name="Satellite">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  />
                </BaseLayer>
                
                {/* State Outline for selected state (default unchecked) */}
                {selectedState && (externalBoundary || stateBoundaries[selectedState]) && (
                  <Overlay name={`${selectedState} State Boundary`}>
                    <GeoJSON
                      key={`state-${selectedState}-${layersVersion}`}
                      data={(externalBoundary || stateBoundaries[selectedState]) as any}
                      style={{ color: '#16a34a', weight: 3, fillOpacity: 0.05 }}
                    />
                  </Overlay>
                )}

                <Overlay name="District Boundaries">
                  <GeoJSON 
                    key={`districts-${layersVersion}`}
                    data={filteredDistrictFC}
                    style={{ color: '#374151', weight: 2, fillOpacity: 0.1 }}
                  />
                </Overlay>
                <Overlay name="FRA Land">
                  <GeoJSON 
                    key={`fra-${layersVersion}`}
                    data={filteredLayers.fraLand}
                    style={layerStyles.fraLand}
                  />
                </Overlay>
                <Overlay name="Forest Cover">
                  <GeoJSON 
                    key={`forest-${layersVersion}`}
                    data={filteredLayers.forest}
                    style={layerStyles.forest}
                  />
                </Overlay>
                <Overlay name="Agricultural Land">
                  <GeoJSON 
                    key={`farmland-${layersVersion}`}
                    data={filteredLayers.farmland}
                    style={layerStyles.farmland}
                  />
                </Overlay>
                <Overlay name="Water Bodies">
                  <GeoJSON 
                    key={`water-${layersVersion}`}
                    data={filteredLayers.water}
                    style={layerStyles.water}
                  />
                </Overlay>
                <Overlay name="Villages">
                  <GeoJSON 
                    key={`villages-${layersVersion}`}
                    data={filteredLayers.villages}
                    style={layerStyles.villages}
                  />
                </Overlay>
              </LayersControl>
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="p-4 bg-gray-50 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 opacity-60 rounded mr-2"></div>
                <span>FRA Land</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 opacity-80 rounded mr-2"></div>
                <span>Forest Cover</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 opacity-60 rounded mr-2"></div>
                <span>Agricultural</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 opacity-70 rounded mr-2"></div>
                <span>Water Bodies</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-amber-800 opacity-40 rounded mr-2"></div>
                <span>Villages</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">2,847 ha</div>
            <div className="text-gray-600 text-sm">FRA Land Mapped</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">1,543</div>
            <div className="text-gray-600 text-sm">Water Sources</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-orange-600">3,672 ha</div>
            <div className="text-gray-600 text-sm">Agricultural Area</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-purple-600">186</div>
            <div className="text-gray-600 text-sm">Villages Covered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRAAtlas;