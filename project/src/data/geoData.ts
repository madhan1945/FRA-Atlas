// Sample GeoJSON data for different layers
export const sampleDistrictBoundaries = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Mayurbhanj',
        state: 'Odisha',
        population: 2519738
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [85.8, 22.1], [86.8, 22.1], [86.8, 21.3], [85.8, 21.3], [85.8, 22.1]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Sundargarh',
        state: 'Odisha',
        population: 2093437
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [83.5, 22.5], [85.0, 22.5], [85.0, 21.5], [83.5, 21.5], [83.5, 22.5]
        ]]
      }
    }
  ]
};

export const sampleGeoData = {
  fraLand: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'FRA Land - Parsoli Village',
          area: 245.6,
          claimStatus: 'Approved',
          claimants: 45
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [85.9, 21.8], [86.1, 21.8], [86.1, 21.6], [85.9, 21.6], [85.9, 21.8]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'FRA Land - Kenduguda Village',
          area: 189.3,
          claimStatus: 'Under Review',
          claimants: 32
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [84.2, 22.1], [84.4, 22.1], [84.4, 21.9], [84.2, 21.9], [84.2, 22.1]
          ]]
        }
      }
    ]
  },
  forest: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Simlipal Forest Reserve',
          forestType: 'Dense Forest',
          area: 2750
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [86.0, 21.7], [86.3, 21.7], [86.3, 21.4], [86.0, 21.4], [86.0, 21.7]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Karlapat Wildlife Sanctuary',
          forestType: 'Protected Forest',
          area: 175
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [84.0, 22.0], [84.2, 22.0], [84.2, 21.8], [84.0, 21.8], [84.0, 22.0]
          ]]
        }
      }
    ]
  },
  farmland: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Agricultural Area - Baripada',
          cropType: 'Rice',
          area: 156.8
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [86.7, 21.9], [86.9, 21.9], [86.9, 21.7], [86.7, 21.7], [86.7, 21.9]
          ]]
        }
      }
    ]
  },
  water: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Budhabalanga River',
          type: 'River',
          length: 175
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [86.2, 22.0], [86.4, 21.8], [86.6, 21.6], [86.8, 21.4]
          ]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Village Pond - Parsoli',
          type: 'Pond',
          capacity: '2.5 ML'
        },
        geometry: {
          type: 'Point',
          coordinates: [86.0, 21.7]
        }
      }
    ]
  },
  villages: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Parsoli',
          population: 1250,
          households: 245,
          tribe: 'Santhal'
        },
        geometry: {
          type: 'Point',
          coordinates: [86.0, 21.7]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Kenduguda',
          population: 890,
          households: 178,
          tribe: 'Ho'
        },
        geometry: {
          type: 'Point',
          coordinates: [84.3, 22.0]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Baripada',
          population: 2100,
          households: 420,
          tribe: 'Munda'
        },
        geometry: {
          type: 'Point',
          coordinates: [86.8, 21.8]
        }
      }
    ]
  }
};

// Approximate India and Odisha extents for map fitting and outlines (demo-only)
export const indiaBounds: [[number, number], [number, number]] = [
  [6.5546, 68.1114],   // SW
  [35.6745, 97.3956]   // NE
];

export const odishaBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Odisha', iso: 'IN-OD' },
      geometry: {
        type: 'Polygon',
        // Rough bounding polygon for Odisha (for demo). Replace with accurate boundary when available.
        coordinates: [[
          [81.6, 22.7], [83.5, 22.9], [85.0, 22.7], [86.6, 22.6], [87.4, 21.9],
          [87.5, 20.8], [87.0, 19.8], [86.8, 19.2], [85.7, 18.8], [84.6, 18.0],
          [83.8, 18.2], [83.0, 18.5], [82.4, 19.0], [82.0, 19.8], [81.7, 20.7],
          [81.6, 21.5], [81.6, 22.2], [81.6, 22.7]
        ]]
      }
    }
  ]
};

// Additional rough state boundaries for demo purposes only
export const jharkhandBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Jharkhand', iso: 'IN-JH' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [83.0, 25.1], [85.8, 25.1], [86.7, 24.7], [87.0, 24.0], [86.5, 23.2],
          [85.5, 22.8], [84.4, 22.6], [83.4, 22.7], [83.0, 23.4], [82.8, 24.2],
          [83.0, 25.1]
        ]]
      }
    }
  ]
};

export const telanganaBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Telangana', iso: 'IN-TG' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.0, 19.5], [80.0, 19.5], [80.5, 18.8], [80.0, 17.8], [79.5, 17.0],
          [78.5, 16.5], [77.6, 16.8], [77.0, 17.6], [76.8, 18.5], [77.0, 19.5]
        ]]
      }
    }
  ]
};

export const madhyaPradeshBoundary = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Madhya Pradesh', iso: 'IN-MP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.0, 26.6], [78.5, 26.9], [81.5, 26.5], [82.4, 25.5], [82.5, 24.0],
          [81.4, 22.8], [79.0, 21.9], [77.0, 21.5], [75.0, 22.0], [74.0, 23.2],
          [73.5, 24.8], [74.0, 26.6]
        ]]
      }
    }
  ]
};

// Convenience lookup for state boundaries
export const stateBoundaries: Record<string, any> = {
  Odisha: odishaBoundary,
  Jharkhand: jharkhandBoundary,
  Telangana: telanganaBoundary,
  'Madhya Pradesh': madhyaPradeshBoundary,
};

// Extend sample districts with a few demo districts for the added states
// Note: Demo polygons are rough boxes within the above boundaries
// Jharkhand
// @ts-ignore augment existing features array
sampleDistrictBoundaries.features.push(
  {
    type: 'Feature',
    properties: { name: 'Ranchi', state: 'Jharkhand', population: 2912022 },
    geometry: { type: 'Polygon', coordinates: [[[85.1, 23.6], [85.7, 23.6], [85.7, 23.1], [85.1, 23.1], [85.1, 23.6]]] }
  },
  {
    type: 'Feature',
    properties: { name: 'West Singhbhum', state: 'Jharkhand', population: 1502338 },
    geometry: { type: 'Polygon', coordinates: [[[85.3, 22.8], [86.1, 22.8], [86.1, 22.2], [85.3, 22.2], [85.3, 22.8]]] }
  }
);

// Telangana
// @ts-ignore augment existing features array
sampleDistrictBoundaries.features.push(
  {
    type: 'Feature',
    properties: { name: 'Hyderabad', state: 'Telangana', population: 3943323 },
    geometry: { type: 'Polygon', coordinates: [[[78.3, 17.6], [78.7, 17.6], [78.7, 17.2], [78.3, 17.2], [78.3, 17.6]]] }
  },
  {
    type: 'Feature',
    properties: { name: 'Warangal', state: 'Telangana', population: 1120000 },
    geometry: { type: 'Polygon', coordinates: [[[79.3, 18.2], [79.9, 18.2], [79.9, 17.8], [79.3, 17.8], [79.3, 18.2]]] }
  }
);

// Madhya Pradesh
// @ts-ignore augment existing features array
sampleDistrictBoundaries.features.push(
  {
    type: 'Feature',
    properties: { name: 'Bhopal', state: 'Madhya Pradesh', population: 2371061 },
    geometry: { type: 'Polygon', coordinates: [[[77.2, 23.5], [77.7, 23.5], [77.7, 23.0], [77.2, 23.0], [77.2, 23.5]]] }
  },
  {
    type: 'Feature',
    properties: { name: 'Indore', state: 'Madhya Pradesh', population: 3272335 },
    geometry: { type: 'Polygon', coordinates: [[[75.9, 22.9], [76.6, 22.9], [76.6, 22.4], [75.9, 22.4], [75.9, 22.9]]] }
  }
);