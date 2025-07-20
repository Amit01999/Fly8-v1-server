const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  code: { type: String },
  name: { type: String },
  flagUrl: { type: String },
  heroImage: { type: String },
  quickFacts: {
    population: { type: String },
    capital: { type: String },
    language: { type: String },
    currency: { type: String },
    academicYear: { type: String },
  },
  keyDates: {
    fallDeadline: { type: String },
    springDeadline: { type: String },
    summerDeadline: { type: String },
  },
  overviewSections: [
    {
      title: { type: String },
      description: { type: String },
      points: [
        {
          heading: { type: String },
          text: { type: String },
        },
      ],
      cards: [
        {
          color: { type: String },
          title: { type: String },
          subtitle: { type: String },
          points: [{ type: String }],
        },
      ],
      note: {
        text: { type: String },
        color: { type: String },
        border: { type: String },
        textColor: { type: String },
      },
    },
  ],
  topcourse: [
    {
      title: { type: String },
      details: { type: String },
      color: { type: String },
    },
  ],
  topuniversities: [
    {
      name: { type: String },
      location: { type: String },
      rank: { type: String },
      notable: { type: String },
    },
  ],
  intakes: [
    {
      label: { type: String },
      description: { type: String },
      icon: { type: String },
    },
  ],
  deadlines: [
    {
      title: { type: String },
      icon: { type: String },
      details: [{ type: String }],
    },
  ],
  admissionnotes: [{ type: String }],
  requirementsData: [
    {
      title: { type: String },
      color: { type: String },
      items: [{ type: String }],
    },
  ],
  CountrySpecificRequirements: { type: String },
  tuitionData: [
    {
      level: { type: String },
      range: { type: String },
      average: { type: String },
      notes: { type: String },
    },
  ],
  tuitionNote: { type: String },
  expenses: [
    {
      label: { type: String },
      range: { type: String },
      percentage: { type: Number },
    },
  ],
  regionalCosts: [
    {
      region: { type: String },
      level: { type: String },
      color: { type: String },
      range: { type: String },
    },
  ],
  scholarships: [
    {
      category: { type: String },
      color: { type: String },
      items: [
        {
          title: { type: String },
          description: { type: String },
        },
      ],
    },
  ],
  financialSupports: [
    {
      title: { type: String },
      description: { type: String },
    },
  ],
  TipsforScholarship: [{ type: String }],
  spainVisaData: {
    title: { type: String },
    intro: { type: String },
    sections: [
      {
        title: { type: String },
        color: { type: String },
        items: [{ type: String }],
      },
    ],
    facts: [{ type: String }],
    benefits: [
      {
        title: { type: String },
        description: { type: String },
      },
    ],
  },
  visaStepsData: [
    {
      step: { type: String },
      title: { type: String },
      color: { type: String },
      content: { type: String },
    },
  ],
  workOpportunitiesData: [
    {
      title: { type: String },
      color: { type: String },
      sections: [
        {
          heading: { type: String },
          points: [{ type: String }],
        },
      ],
    },
  ],
  jobMarketData: {
    sectors: [{ type: String }],
    salaries: [{ type: String }],
  },
  bestCitiesData: [
    {
      city: { type: String },
      image: { type: String },
      universities: { type: String },
      description: { type: String },
      highlights: [{ type: String }],
    },
  ],
  studentLifeData: {
    title: { type: String },
    icon: {
      bg: { type: String },
      color: { type: String },
    },
    sections: [
      {
        title: { type: String },
        bg: { type: String },
        border: { type: String },
        textColor: { type: String },
        items: [
          {
            title: { type: String },
            description: { type: String },
            badges: [{ type: String }],
          },
        ],
      },
    ],
    additionalInfo: {
      title: { type: String },
      description: { type: String },
      items: [
        {
          title: { type: String },
          points: [{ type: String }],
        },
      ],
    },
  },
  latestUpdates2025: [
    {
      title: { type: String },
      description: { type: String },
      content: { type: String },
      category: { type: String },
      gradient: { type: String },
      border: { type: String },
      badgeColor: { type: String },
      titleColor: { type: String },
    },
  ],
  policyChanges2025: [
    {
      title: { type: String },
      content: { type: String },
    },
  ],
  resourcecards: [
    {
      title: { type: String },
      description: { type: String },
      buttonText: { type: String },
      gradient: { type: String },
      borderColor: { type: String },
      textColor: { type: String },
      buttonColor: { type: String },
    },
  ],
  resourceofficialLinks: [
    {
      label: { type: String },
      href: { type: String },
    },
  ],
  resourceguides: [
    {
      label: { type: String },
      href: { type: String },
    },
  ],
  resourcetools: [
    {
      title: { type: String },
      description: { type: String },
      buttonText: { type: String },
    },
  ],
  faqs: [
    {
      question: { type: String },
      answer: { type: String },
    },
  ],
});

const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;
