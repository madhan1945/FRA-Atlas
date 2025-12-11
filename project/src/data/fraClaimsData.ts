export interface FRAClaim {
  claimId: string;
  claimantName: string;
  village: string;
  district: string;
  state: string;
  tribe: string;
  landAreaHa: number;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Under Review';
  submissionDate: string;
  lastUpdated: string;
  claimType: string;
}

export const fraClaimsData: FRAClaim[] = [
  {
    claimId: 'FRA/OD/MAY/2024/001',
    claimantName: 'Arjun Munda',
    village: 'Parsoli',
    district: 'Mayurbhanj',
    state: 'Odisha',
    tribe: 'Munda',
    landAreaHa: 2.5,
    status: 'Approved',
    submissionDate: '2024-01-15',
    lastUpdated: '2024-03-20',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/OD/MAY/2024/002',
    claimantName: 'Sita Santhal',
    village: 'Kenduguda',
    district: 'Mayurbhanj',
    state: 'Odisha',
    tribe: 'Santhal',
    landAreaHa: 1.8,
    status: 'Under Review',
    submissionDate: '2024-02-10',
    lastUpdated: '2024-04-15',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/OD/SUN/2024/003',
    claimantName: 'Ramesh Ho',
    village: 'Baripada',
    district: 'Sundargarh',
    state: 'Odisha',
    tribe: 'Ho',
    landAreaHa: 3.2,
    status: 'Pending',
    submissionDate: '2024-01-25',
    lastUpdated: '2024-04-01',
    claimType: 'Community Forest Rights'
  },
  {
    claimId: 'FRA/JH/RAN/2024/004',
    claimantName: 'Lakshmi Oraon',
    village: 'Ghatsila',
    district: 'East Singhbhum',
    state: 'Jharkhand',
    tribe: 'Oraon',
    landAreaHa: 2.1,
    status: 'Approved',
    submissionDate: '2024-02-05',
    lastUpdated: '2024-03-25',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/CG/BAL/2024/005',
    claimantName: 'Govind Gond',
    village: 'Ambikapur',
    district: 'Balrampur',
    state: 'Chhattisgarh',
    tribe: 'Gond',
    landAreaHa: 4.5,
    status: 'Rejected',
    submissionDate: '2024-01-08',
    lastUpdated: '2024-02-28',
    claimType: 'Community Forest Rights'
  },
  {
    claimId: 'FRA/MP/MAN/2024/006',
    claimantName: 'Kamala Bhil',
    village: 'Dhar',
    district: 'Mandla',
    state: 'Madhya Pradesh',
    tribe: 'Bhil',
    landAreaHa: 1.9,
    status: 'Approved',
    submissionDate: '2024-03-01',
    lastUpdated: '2024-04-10',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/MH/GAD/2024/007',
    claimantName: 'Suresh Warli',
    village: 'Dahanu',
    district: 'Gadchiroli',
    state: 'Maharashtra',
    tribe: 'Warli',
    landAreaHa: 2.8,
    status: 'Under Review',
    submissionDate: '2024-02-18',
    lastUpdated: '2024-04-05',
    claimType: 'Community Forest Rights'
  },
  {
    claimId: 'FRA/OD/KAN/2024/008',
    claimantName: 'Ravi Kandha',
    village: 'Tumudibandh',
    district: 'Kandhamal',
    state: 'Odisha',
    tribe: 'Kandha',
    landAreaHa: 3.7,
    status: 'Pending',
    submissionDate: '2024-03-12',
    lastUpdated: '2024-04-20',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/JH/HAZ/2024/009',
    claimantName: 'Mina Kurmi',
    village: 'Hazaribagh',
    district: 'Hazaribagh',
    state: 'Jharkhand',
    tribe: 'Kurmi',
    landAreaHa: 1.6,
    status: 'Approved',
    submissionDate: '2024-01-30',
    lastUpdated: '2024-03-15',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/CG/RAI/2024/010',
    claimantName: 'Dharam Kawar',
    village: 'Raigarh',
    district: 'Raigarh',
    state: 'Chhattisgarh',
    tribe: 'Kawar',
    landAreaHa: 2.3,
    status: 'Under Review',
    submissionDate: '2024-02-22',
    lastUpdated: '2024-04-12',
    claimType: 'Community Forest Rights'
  },
  {
    claimId: 'FRA/MP/SHA/2024/011',
    claimantName: 'Priya Baiga',
    village: 'Shahdol',
    district: 'Shahdol',
    state: 'Madhya Pradesh',
    tribe: 'Baiga',
    landAreaHa: 2.9,
    status: 'Approved',
    submissionDate: '2024-03-05',
    lastUpdated: '2024-04-18',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/MH/NAN/2024/012',
    claimantName: 'Anil Koli',
    village: 'Nandurbar',
    district: 'Nandurbar',
    state: 'Maharashtra',
    tribe: 'Koli',
    landAreaHa: 1.4,
    status: 'Pending',
    submissionDate: '2024-03-18',
    lastUpdated: '2024-04-22',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/OD/RAY/2024/013',
    claimantName: 'Sunita Dongria',
    village: 'Rayagada',
    district: 'Rayagada',
    state: 'Odisha',
    tribe: 'Dongria Kondh',
    landAreaHa: 4.1,
    status: 'Under Review',
    submissionDate: '2024-02-28',
    lastUpdated: '2024-04-08',
    claimType: 'Community Forest Rights'
  },
  {
    claimId: 'FRA/JH/DUM/2024/014',
    claimantName: 'Kiran Santal',
    village: 'Dumka',
    district: 'Dumka',
    state: 'Jharkhand',
    tribe: 'Santal',
    landAreaHa: 2.7,
    status: 'Approved',
    submissionDate: '2024-01-20',
    lastUpdated: '2024-03-30',
    claimType: 'Individual Forest Rights'
  },
  {
    claimId: 'FRA/CG/BIL/2024/015',
    claimantName: 'Mohan Halba',
    village: 'Bilaspur',
    district: 'Bilaspur',
    state: 'Chhattisgarh',
    tribe: 'Halba',
    landAreaHa: 1.7,
    status: 'Rejected',
    submissionDate: '2024-03-08',
    lastUpdated: '2024-04-25',
    claimType: 'Individual Forest Rights'
  }
];