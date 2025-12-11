import React, { useState } from 'react';
import { Brain, CheckSquare, AlertCircle, Lightbulb, TrendingUp, Users, MapPin, Calendar, Star, Award, Target } from 'lucide-react';

interface VillageProfile {
  name: string;
  population: number;
  households: number;
  primaryTribe: string;
  geographicFeatures: string[];
  economicActivities: string[];
  infrastructureGaps: string[];
}

interface SchemeRecommendation {
  scheme: string;
  description: string;
  eligibility: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  estimatedBenefit: string;
  implementationTime: string;
  fundingAmount: string;
  successProbability: number;
  aiReasoning: string;
  prerequisites: string[];
  expectedOutcome: string;
}

const DSS = () => {
  const [villageName, setVillageName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [villageSize, setVillageSize] = useState('');
  const [primaryLivelihood, setPrimaryLivelihood] = useState('');
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [villageProfile, setVillageProfile] = useState<VillageProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');

  const states = ['Odisha', 'Jharkhand', 'Telangana', 'Madhya Pradesh'];
  const stateDistricts: Record<string, string[]> = {
    Odisha: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
      'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur',
      'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha',
      'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
      'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
    ],
    Jharkhand: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa',
      'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
      'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj',
      'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
    ],
    Telangana: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
      'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad',
      'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri', 'Mulugu', 'Nagarkurnool',
      'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy',
      'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ],
    'Madhya Pradesh': [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
      'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh',
      'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad',
      'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla',
      'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh',
      'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur',
      'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria',
      'Vidisha', 'Niwari'
    ]
  };

  // Reset district when state changes
  React.useEffect(() => { setSelectedDistrict(''); }, [selectedState]);
  const districts = selectedState ? (stateDistricts[selectedState] || []) : [];

  const availableResources = [
    { id: 'water_abundant', label: 'Abundant Water Sources', icon: '💧', weight: 3 },
    { id: 'water_limited', label: 'Limited Water Access', icon: '🚰', weight: 1 },
    { id: 'dense_forest', label: 'Dense Forest Cover', icon: '🌲', weight: 3 },
    { id: 'degraded_forest', label: 'Degraded Forest Land', icon: '🌿', weight: 1 },
    { id: 'fertile_land', label: 'Fertile Agricultural Land', icon: '🌾', weight: 3 },
    { id: 'marginal_land', label: 'Marginal/Rocky Land', icon: '🏔️', weight: 1 },
    { id: 'mineral_deposits', label: 'Mineral Deposits', icon: '⛏️', weight: 2 },
    { id: 'wildlife_corridor', label: 'Wildlife Corridor', icon: '🦌', weight: 2 },
    { id: 'river_access', label: 'River/Stream Access', icon: '🏞️', weight: 2 },
    { id: 'traditional_crafts', label: 'Traditional Craft Skills', icon: '🎨', weight: 2 },
  ];

  const challenges = [
    { id: 'no_electricity', label: 'No Electricity Connection', icon: '⚡', severity: 'critical' },
    { id: 'poor_roads', label: 'Poor Road Connectivity', icon: '🛣️', severity: 'high' },
    { id: 'no_healthcare', label: 'No Healthcare Facility', icon: '🏥', severity: 'critical' },
    { id: 'no_school', label: 'No Primary School', icon: '🏫', severity: 'high' },
    { id: 'water_scarcity', label: 'Seasonal Water Scarcity', icon: '🏜️', severity: 'high' },
    { id: 'unemployment', label: 'High Unemployment', icon: '💼', severity: 'medium' },
    { id: 'migration', label: 'Youth Migration to Cities', icon: '🏃', severity: 'medium' },
    { id: 'land_disputes', label: 'Land Rights Disputes', icon: '⚖️', severity: 'high' },
  ];

  const villageSizes = [
    { value: 'small', label: 'Small (< 500 people)', multiplier: 0.8 },
    { value: 'medium', label: 'Medium (500-2000 people)', multiplier: 1.0 },
    { value: 'large', label: 'Large (> 2000 people)', multiplier: 1.2 },
  ];

  const livelihoods = [
    { value: 'agriculture', label: 'Agriculture & Farming', boost: ['farmland', 'water'] },
    { value: 'forest_produce', label: 'Forest Produce Collection', boost: ['forest', 'traditional_crafts'] },
    { value: 'livestock', label: 'Animal Husbandry', boost: ['water', 'grazing_land'] },
    { value: 'mixed', label: 'Mixed Livelihood', boost: [] },
  ];

  const advancedSchemeDatabase: SchemeRecommendation[] = [
    {
      scheme: 'Jal Jeevan Mission - Priority Implementation',
      description: 'Accelerated piped water supply with smart monitoring systems',
      eligibility: 'Villages with water scarcity or limited access',
      priority: 'critical',
      category: 'Water & Sanitation',
      estimatedBenefit: '₹15-25 lakhs per village',
      implementationTime: '8-12 months',
      fundingAmount: '₹55 per capita',
      successProbability: 92,
      aiReasoning: 'Critical infrastructure gap identified. High success rate in similar tribal areas.',
      prerequisites: ['Village Water Committee formation', 'Land availability for infrastructure'],
      expectedOutcome: '100% household tap connections, reduced waterborne diseases by 70%'
    },
    {
      scheme: 'Van Dhan Vikas Karyakram - Cluster Development',
      description: 'Tribal entrepreneurship through Minor Forest Produce value addition',
      eligibility: 'Forest-dependent tribal communities',
      priority: 'high',
      category: 'Livelihood & Economy',
      estimatedBenefit: '₹2-5 lakhs annual income increase',
      implementationTime: '6-9 months',
      fundingAmount: '₹10 lakhs per cluster',
      successProbability: 78,
      aiReasoning: 'Strong forest resources detected. Traditional skills present for value addition.',
      prerequisites: ['SHG formation', 'MFP collection rights', 'Market linkage establishment'],
      expectedOutcome: '300% increase in MFP income, 50 direct jobs created'
    },
    {
      scheme: 'PM-KISAN with Organic Certification',
      description: 'Enhanced farmer support with organic farming transition',
      eligibility: 'Small and marginal farmers',
      priority: 'high',
      category: 'Agriculture',
      estimatedBenefit: '₹6,000 + ₹15,000 organic premium',
      implementationTime: '3-6 months',
      fundingAmount: '₹6,000 per farmer annually',
      successProbability: 85,
      aiReasoning: 'Fertile land available. Organic farming potential due to minimal chemical use.',
      prerequisites: ['Land records verification', 'Soil testing', 'Organic certification process'],
      expectedOutcome: '250% increase in farm income, sustainable agriculture practices'
    },
    {
      scheme: 'Saubhagya Plus - Solar Microgrid',
      description: 'Renewable energy solution with battery backup systems',
      eligibility: 'Un-electrified or poorly connected villages',
      priority: 'critical',
      category: 'Energy',
      estimatedBenefit: '₹8-12 lakhs per village',
      implementationTime: '4-6 months',
      fundingAmount: '₹18,000 per household',
      successProbability: 88,
      aiReasoning: 'Electricity gap critical for development. Solar potential high in tribal areas.',
      prerequisites: ['Technical survey', 'Community agreement', 'Maintenance training'],
      expectedOutcome: '24x7 power supply, 60% reduction in energy costs'
    },
    {
      scheme: 'Ayushman Bharat - Health & Wellness Center',
      description: 'Comprehensive primary healthcare with telemedicine',
      eligibility: 'Villages without adequate healthcare facilities',
      priority: 'critical',
      category: 'Healthcare',
      estimatedBenefit: '₹5 lakh insurance + free services',
      implementationTime: '6-8 months',
      fundingAmount: '₹12 lakhs setup cost',
      successProbability: 82,
      aiReasoning: 'Healthcare gap identified as critical. High impact on maternal and child health.',
      prerequisites: ['ASHA worker training', 'Building/space availability', 'Equipment procurement'],
      expectedOutcome: '80% reduction in out-of-pocket health expenses, improved health indicators'
    },
    {
      scheme: 'PMGSY - All Weather Road Connectivity',
      description: 'Climate-resilient road infrastructure with digital monitoring',
      eligibility: 'Unconnected habitations with 250+ population',
      priority: 'high',
      category: 'Infrastructure',
      estimatedBenefit: '₹50-80 lakhs per km',
      implementationTime: '12-18 months',
      fundingAmount: '₹65 lakhs per km',
      successProbability: 75,
      aiReasoning: 'Road connectivity essential for market access and emergency services.',
      prerequisites: ['Environmental clearance', 'Land acquisition', 'Technical approval'],
      expectedOutcome: 'Year-round market access, 40% increase in agricultural income'
    },
  ];

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const simulateAIAnalysis = async () => {
    const stages = [
      'Analyzing village demographics...',
      'Processing resource availability...',
      'Evaluating infrastructure gaps...',
      'Cross-referencing scheme database...',
      'Calculating success probabilities...',
      'Generating personalized recommendations...'
    ];

    for (let i = 0; i < stages.length; i++) {
      setAnalysisStage(stages[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const generateAdvancedRecommendations = async () => {
    if (!villageName.trim() || !villageSize || !primaryLivelihood) {
      alert('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    await simulateAIAnalysis();

    // Generate village profile
    const profile: VillageProfile = {
      name: villageName,
      population: villageSize === 'small' ? 350 : villageSize === 'medium' ? 1200 : 2800,
      households: villageSize === 'small' ? 70 : villageSize === 'medium' ? 240 : 560,
      primaryTribe: 'Santhal', // Simulated
      geographicFeatures: [selectedState, selectedDistrict].filter(Boolean).concat(
        selectedResources.map(r => availableResources.find(ar => ar.id === r)?.label || '')
      ),
      economicActivities: [primaryLivelihood.replace('_', ' ')],
      infrastructureGaps: selectedChallenges.map(c => challenges.find(ch => ch.id === c)?.label || '')
    };

    // Advanced AI-like scoring algorithm
    const applicable = advancedSchemeDatabase.filter(scheme => {
      let score = 0;
      
      // Challenge-based scoring
      if (selectedChallenges.includes('no_electricity') && scheme.category === 'Energy') score += 30;
      if (selectedChallenges.includes('no_healthcare') && scheme.category === 'Healthcare') score += 30;
      if (selectedChallenges.includes('poor_roads') && scheme.category === 'Infrastructure') score += 25;
      if (selectedChallenges.includes('water_scarcity') && scheme.category === 'Water & Sanitation') score += 30;
      
      // Resource-based scoring
      if (selectedResources.includes('dense_forest') && scheme.scheme.includes('Van Dhan')) score += 25;
      if (selectedResources.includes('fertile_land') && scheme.category === 'Agriculture') score += 20;
      
      // Livelihood alignment
      if (primaryLivelihood === 'agriculture' && scheme.category === 'Agriculture') score += 15;
      if (primaryLivelihood === 'forest_produce' && scheme.scheme.includes('Van Dhan')) score += 20;
      
      return score > 15; // Threshold for relevance
    });

    // Sort by priority and success probability
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    applicable.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.successProbability - a.successProbability;
    });

    setVillageProfile(profile);
    setRecommendations(applicable.slice(0, 6)); // Top 6 recommendations
    setIsAnalyzing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'low': return <CheckSquare className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="h-10 w-10 text-blue-600 mr-4" />
            AI-Powered Decision Support System
          </h1>
          <p className="text-xl text-gray-600">
            Advanced analytics and machine learning for optimal government scheme recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Input Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 text-green-600 mr-2" />
                Village Assessment
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-2">
                    Village Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="village"
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    placeholder="Enter village name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select state</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedState}
                    className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{selectedState ? 'Select district' : 'Select a state first'}</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={villageSize}
                    onChange={(e) => setVillageSize(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select village size</option>
                    {villageSizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Livelihood <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={primaryLivelihood}
                    onChange={(e) => setPrimaryLivelihood(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select primary livelihood</option>
                    {livelihoods.map(livelihood => (
                      <option key={livelihood.value} value={livelihood.value}>{livelihood.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Available Resources
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {availableResources.map((resource) => (
                      <label
                        key={resource.id}
                        className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.id)}
                          onChange={() => handleResourceToggle(resource.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-lg">{resource.icon}</span>
                        <span className="ml-2 text-sm text-gray-700">{resource.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Key Challenges
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {challenges.map((challenge) => (
                      <label
                        key={challenge.id}
                        className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedChallenges.includes(challenge.id)}
                          onChange={() => handleChallengeToggle(challenge.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-lg">{challenge.icon}</span>
                        <span className="ml-2 text-sm text-gray-700">{challenge.label}</span>
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          challenge.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          challenge.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {challenge.severity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateAdvancedRecommendations}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Generate AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="xl:col-span-2">
            {isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis in Progress</h3>
                  <p className="text-blue-600 font-medium">{analysisStage}</p>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {villageProfile && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  Village Profile Analysis
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{villageProfile.population}</div>
                    <div className="text-sm text-gray-600">Population</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{villageProfile.households}</div>
                    <div className="text-sm text-gray-600">Households</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedResources.length}</div>
                    <div className="text-sm text-gray-600">Resources</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedChallenges.length}</div>
                    <div className="text-sm text-gray-600">Challenges</div>
                  </div>
                </div>
              </div>
            )}

            {recommendations.length > 0 && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lightbulb className="h-7 w-7 text-yellow-500 mr-3" />
                  AI-Generated Scheme Recommendations
                </h3>

                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            {getPriorityIcon(rec.priority)}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{rec.scheme}</h4>
                            <p className="text-sm text-gray-600">{rec.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs font-medium border rounded-full ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-xs font-medium text-green-700">{rec.successProbability}%</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{rec.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-blue-900">Estimated Benefit</div>
                          <div className="text-lg font-bold text-blue-700">{rec.estimatedBenefit}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-green-900">Implementation</div>
                          <div className="text-lg font-bold text-green-700">{rec.implementationTime}</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-purple-900">Funding</div>
                          <div className="text-lg font-bold text-purple-700">{rec.fundingAmount}</div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <Brain className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-yellow-900 mb-1">AI Analysis</div>
                            <div className="text-sm text-yellow-800">{rec.aiReasoning}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-2">Prerequisites</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.prerequisites.map((prereq, i) => (
                              <li key={i} className="flex items-center">
                                <CheckSquare className="h-3 w-3 text-green-500 mr-2" />
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-2">Expected Outcome</div>
                          <p className="text-sm text-gray-600">{rec.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Implementation Roadmap
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-blue-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Phase 1: Documentation & Approvals (1-2 months)</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Phase 2: Community Mobilization (2-3 months)</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>Phase 3: Implementation & Monitoring (6-12 months)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {recommendations.length === 0 && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for AI Analysis</h3>
                <p className="text-gray-500">
                  Complete the village assessment form to receive personalized scheme recommendations powered by advanced analytics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSS;