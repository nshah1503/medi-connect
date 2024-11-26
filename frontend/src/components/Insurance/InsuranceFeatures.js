import React from 'react';
import { Link } from 'react-router-dom';
import Layout from "../Layout/Layout";

const InsuranceFeatures = () => {
  const features = [
    {
      id: 1,
      name: 'E-Card',
      description: 'Download e-cards for you and your family.',
      link: '/ecard',
    },
    {
      id: 2,
      name: 'Claims',
      description: 'Track your claims in real-time.',
      link: '/claims',
    },
    {
      id: 3,
      name: 'Network Hospitals',
      description: 'Find nearby network hospitals for cashless treatment.',
      link: '/network-hospitals',
    },
    {
      id: 4,
      name: 'Empanel Hospitals',
      description: 'Become part of our network hospitals.',
      link: '/empanelhospital',
    },
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="flex-1 min-w-[200px] max-w-[300px] bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {feature.name}
          </h3>
          <p className="text-gray-600 mb-4">{feature.description}</p>
          <Link
            to={feature.link}
            className="text-blue-600 font-semibold hover:underline"
          >
            Learn More →
          </Link>
        </div>
      ))}
    </div>
  );
};

export default InsuranceFeatures;
