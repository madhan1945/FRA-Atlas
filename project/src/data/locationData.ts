export const statesList = ['Odisha', 'Jharkhand', 'Telangana', 'Madhya Pradesh'] as const;
export type StateName = typeof statesList[number];

export const districtsByState: Record<string, string[]> = {
  Odisha: ['Mayurbhanj', 'Sundargarh', 'Koraput', 'Cuttack'],
  Jharkhand: ['Ranchi', 'West Singhbhum', 'Dhanbad', 'Dumka'],
  Telangana: ['Hyderabad', 'Warangal', 'Nalgonda', 'Nizamabad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior']
};

export const villagesByDistrict: Record<string, string[]> = {
  // Odisha
  Mayurbhanj: ['Parsoli', 'Baripada', 'Udala'],
  Sundargarh: ['Rourkela', 'Biramitrapur', 'Rajgangpur'],
  Koraput: ['Jeypore', 'Koraput', 'Damanjodi'],
  Cuttack: ['Niali', 'Narsinghpur', 'Salipur'],

  // Jharkhand
  Ranchi: ['Angara', 'Kanke', 'Bundu'],
  'West Singhbhum': ['Chaibasa', 'Manoharpur', 'Jagannathpur'],
  Dhanbad: ['Jharia', 'Baliapur', 'Topchanchi'],
  Dumka: ['Jama', 'Kathikund', 'Masalia'],

  // Telangana
  Hyderabad: ['Shaikpet', 'Golconda', 'Serilingampally'],
  Warangal: ['Kazipet', 'Hanamakonda', 'Parvathagiri'],
  Nalgonda: ['Chityal', 'Vemulapally', 'Anumula'],
  Nizamabad: ['Bodhan', 'Armoor', 'Armur'],

  // Madhya Pradesh
  Bhopal: ['Kolar', 'Berasia', 'Phanda'],
  Indore: ['Sanwer', 'Mhow', 'Depalpur'],
  Jabalpur: ['Panagar', 'Patan', 'Shahpura'],
  Gwalior: ['Bhitarwar', 'Dabra', 'Chinour']
};


