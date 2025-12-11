// Fetch and cache India ADM1 boundaries, then filter for a given state.
// Source: geoBoundaries ADM1 GeoJSON (all states), suitable for accurate outlines.
// https://www.geoboundaries.org/

let adm1Cache: any | null = null;

export async function getAdm1(): Promise<any> {
  if (adm1Cache) return adm1Cache;
  const url = 'https://www.geoboundaries.org/data/geoBoundaries-3_0_0/geojson/IND/ADM1/geoBoundaries-IND-ADM1.geojson';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ADM1 boundaries');
  adm1Cache = await res.json();
  return adm1Cache;
}

export async function getStateBoundary(stateName: string): Promise<any | null> {
  const fc = await getAdm1();
  const features = (fc?.features || []) as any[];
  const match = features.find((f) => {
    const props = f.properties || {};
    const names = [props.shapeName, props.name, props.NAME_1, props.state, props.st_name].filter(Boolean).map((x: string) => String(x).toLowerCase());
    const target = stateName.toLowerCase();
    return names.includes(target);
  });
  if (!match) return null;
  return { type: 'FeatureCollection', features: [match] };
}


