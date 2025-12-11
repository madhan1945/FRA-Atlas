import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Database, FileText, ArrowRight, Users, Target, Globe } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Map className="h-8 w-8 text-green-600" />,
      title: 'Interactive FRA Atlas',
      description: 'Explore forest rights areas with comprehensive WebGIS mapping and layer visualization.',
      link: '/atlas',
    },
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: 'Decision Support System',
      description: 'Get AI-powered recommendations for government schemes based on community resources.',
      link: '/dss',
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: 'Digitized Records',
      description: 'Access and search through digitized FRA claims and community records.',
      link: '/records',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center animate-pan-slow" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=2000&auto=format&fit=crop')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 via-green-800/35 to-green-900/40" />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-50 drop-shadow mb-4">Van Adhikaar</h1>
          <p className="text-green-100 text-lg md:text-2xl max-w-2xl mx-auto">
            Forest Rights Act (2006) — Empowering forest communities with knowledge and tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;