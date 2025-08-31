// const mongoose = require('mongoose');
// const Country = require('../models/Country.js');

// const MONGO_URL =
//   'mongodb+srv://Shopno:Shopno24@cluster1.npnsgne.mongodb.net/Fly8?retryWrites=true&w=majority&appName=Cluster1';

// // Bangladesh data as an array of objects
// const bangladeshData = {
//   code: 'bangladesh',
//   name: 'Bangladesh',
//   flagUrl: 'https://flagcdn.com/w320/bd.png',
//   heroImage:
//     'https://www.outlooktravelmag.com/media/bangladesh-1-1611923974.profileImage.2x-jpg-webp.webp',
//   quickFacts: {
//     population: '173 million',
//     capital: 'Dhaka',
//     language: 'Bengali',
//     currency: 'Bangladeshi Taka (BDT)',
//     academicYear: 'January to December',
//   },
//   keyDates: {
//     fallDeadline: 'November 1 (for January intake)',
//     springDeadline: 'May 1 (for July intake)',
//     summerDeadline: 'August 15 (for September/October intake)',
//   },
//   overviewSections: [
//     {
//       title: 'Why Study in Bangladesh?',
//       description:
//         'Bangladesh offers affordable education, a rich cultural heritage, and growing academic opportunities in a dynamic South Asian context.',
//       points: [
//         {
//           heading: 'Cost-Effective Education',
//           text: 'Low tuition and living costs make studying accessible for international students.',
//         },
//         {
//           heading: 'Cultural Immersion',
//           text: 'Experience vibrant traditions, festivals, and South Asian hospitality.',
//         },
//         {
//           heading: 'Growing Academic Reputation',
//           text: 'Private universities offer English-taught programs with international recognition.',
//         },
//         {
//           heading: 'Strategic Location',
//           text: 'Located in South Asia, ideal for exploring neighboring countries and cultures.',
//         },
//       ],
//     },
//     {
//       title: 'Education System at a Glance',
//       description:
//         'Bangladesh’s education system blends traditional and modern approaches, with public and private institutions offering diverse programs.',
//       cards: [
//         {
//           color: 'red-500',
//           title: 'Undergraduate',
//           subtitle: "Bachelor's Degree",
//           points: [
//             '3-4 years duration',
//             'Honors programs available',
//             'Focus on practical skills',
//             'Industry-aligned courses',
//           ],
//         },
//         {
//           color: 'blue-500',
//           title: 'Postgraduate',
//           subtitle: "Master's Degree",
//           points: [
//             '1-2 years duration',
//             'Coursework or research-based',
//             'Specialized fields',
//             'Internship opportunities',
//           ],
//         },
//         {
//           color: 'purple-500',
//           title: 'Doctorate',
//           subtitle: 'PhD/Doctoral Degree',
//           points: [
//             '3-5 years duration',
//             'Research-driven',
//             'Thesis submission',
//             'International collaborations',
//           ],
//         },
//       ],
//       note: {
//         text: 'Bangladeshi universities use a CGPA system (out of 4.0). First Class (3.5+), Second Class (3.0–3.49), and Pass (2.0–2.99).',
//         color: 'yellow-50',
//         border: 'yellow-100',
//         textColor: 'yellow-700',
//       },
//     },
//   ],
//   topcourse: [
//     {
//       title: 'Business & Management',
//       details: 'BBA, Finance, Marketing',
//       color: 'bg-amber-50 border-amber-200',
//     },
//     {
//       title: 'Engineering',
//       details: 'Civil, Electrical, Computer Engineering',
//       color: 'bg-blue-50 border-blue-200',
//     },
//     {
//       title: 'Computer Science',
//       details: 'Software Engineering, Data Science, AI',
//       color: 'bg-indigo-50 border-indigo-200',
//     },
//     {
//       title: 'Medicine & Healthcare',
//       details: 'MBBS, Pharmacy, Public Health',
//       color: 'bg-red-50 border-red-200',
//     },
//     {
//       title: 'Law',
//       details: 'LLB, Human Rights Law',
//       color: 'bg-purple-50 border-purple-200',
//     },
//     {
//       title: 'Social Sciences',
//       details: 'Economics, Development Studies',
//       color: 'bg-green-50 border-green-200',
//     },
//     {
//       title: 'Arts & Humanities',
//       details: 'English, History, Anthropology',
//       color: 'bg-pink-50 border-pink-200',
//     },
//     {
//       title: 'Textile & Apparel',
//       details: 'Textile Engineering, Fashion Design',
//       color: 'bg-orange-50 border-orange-200',
//     },
//     {
//       title: 'Natural Sciences',
//       details: 'Physics, Chemistry, Biology',
//       color: 'bg-cyan-50 border-cyan-200',
//     },
//   ],
//   topuniversities: [
//     {
//       name: 'University of Dhaka',
//       location: 'Dhaka',
//       rank: '604',
//       notable: 'Arts, Sciences, Social Sciences',
//     },
//     {
//       name: 'Bangladesh University of Engineering and Technology',
//       location: 'Dhaka',
//       rank: '801',
//       notable: 'Engineering, Architecture',
//     },
//     {
//       name: 'BRAC University',
//       location: 'Dhaka',
//       rank: '1001',
//       notable: 'Business, Development Studies',
//     },
//     {
//       name: 'North South University',
//       location: 'Dhaka',
//       rank: '1001',
//       notable: 'Business, IT, Engineering',
//     },
//     {
//       name: 'University of Rajshahi',
//       location: 'Rajshahi',
//       rank: '638',
//       notable: 'Sciences, Humanities',
//     },
//     {
//       name: 'Jahangirnagar University',
//       location: 'Savar',
//       rank: '1001',
//       notable: 'Environmental Science, Arts',
//     },
//     {
//       name: 'Daffodil International University',
//       location: 'Dhaka',
//       rank: '1001',
//       notable: 'IT, Business, Engineering',
//     },
//     {
//       name: 'Chittagong University',
//       location: 'Chittagong',
//       rank: '1201',
//       notable: 'Sciences, Business',
//     },
//   ],
//   intakes: [
//     {
//       label: 'January/February',
//       description: 'Primary intake with most courses available',
//       icon: 'J',
//     },
//     {
//       label: 'July/August',
//       description: 'Secondary intake with selected courses',
//       icon: 'J',
//     },
//     {
//       label: 'September/October',
//       description: 'Limited intake for specific programs',
//       icon: 'S',
//     },
//   ],
//   deadlines: [
//     {
//       title: 'Undergraduate',
//       icon: 'U',
//       details: ['November 1 (January intake)', 'May 1 (July intake)'],
//     },
//     {
//       title: 'Postgraduate',
//       icon: 'P',
//       details: ['Varies, typically 2–4 months before intake'],
//     },
//     {
//       title: 'Scholarships',
//       icon: 'S',
//       details: [
//         'September–November (January intake)',
//         'March–May (July intake)',
//       ],
//     },
//   ],
//   addmissionnotes: [
//     'Apply early for competitive programs like MBBS or engineering',
//     'International students should plan for 1–2 months visa processing',
//     'Verify entry requirements on university websites',
//     'Some private universities offer rolling admissions',
//   ],
//   requirementsData: [
//     {
//       title: 'Undergraduate Requirements',
//       color: 'bg-blue-500',
//       items: [
//         'Completed secondary education (HSC or equivalent)',
//         'High school transcripts/certificates',
//         'English proficiency (IELTS 5.5–6.5 or equivalent)',
//         'Personal statement',
//         '1–2 letters of recommendation',
//         'Entrance exams (for public universities)',
//         'Portfolio (for arts/design programs)',
//         'Interview (for selective programs)',
//       ],
//     },
//     {
//       title: 'Postgraduate Requirements',
//       color: 'bg-purple-500',
//       items: [
//         'Bachelor’s degree (CGPA 2.5–3.0 minimum)',
//         'Academic transcripts',
//         'English proficiency (IELTS 6.0–7.0)',
//         'Research proposal (for research degrees)',
//         'CV/Resume',
//         'Statement of purpose',
//         '2 letters of recommendation',
//         'GRE/GMAT (for select programs)',
//       ],
//     },
//   ],
//   CountrySpecificRequirements:
//     'International qualifications are assessed against Bangladeshi standards by the University Grants Commission (UGC). Equivalency certificates may be required. Foundation programs are available for students not meeting direct entry criteria.',
//   tuitionData: [
//     {
//       level: 'Undergraduate',
//       range: 'BDT 100,000 - BDT 500,000',
//       average: 'BDT 300,000',
//       notes: 'Higher for private universities and MBBS',
//     },
//     {
//       level: 'Postgraduate Taught',
//       range: 'BDT 150,000 - BDT 600,000',
//       average: 'BDT 400,000',
//       notes: 'Varies by program and institution',
//     },
//     {
//       level: 'MBA',
//       range: 'BDT 300,000 - BDT 800,000',
//       average: 'BDT 500,000',
//       notes: 'Private universities charge higher fees',
//     },
//     {
//       level: 'PhD',
//       range: 'BDT 200,000 - BDT 500,000',
//       average: 'BDT 350,000',
//       notes: 'Subsidized for research students',
//     },
//     {
//       level: 'Medicine & Dentistry',
//       range: 'BDT 500,000 - BDT 1,200,000',
//       average: 'BDT 800,000',
//       notes: 'Includes clinical training costs',
//     },
//   ],
//   tuitionNote:
//     'Tuition varies significantly between public and private universities. Additional costs include registration, lab fees, and study materials. Always check university websites for precise fees.',
//   expenses: [
//     {
//       label: 'Accommodation',
//       range: 'BDT 10,000 - BDT 30,000',
//       percentage: 50,
//     },
//     {
//       label: 'Food & Groceries',
//       range: 'BDT 8,000 - BDT 15,000',
//       percentage: 30,
//     },
//     {
//       label: 'Transportation',
//       range: 'BDT 2,000 - BDT 5,000',
//       percentage: 15,
//     },
//     {
//       label: 'Utilities',
//       range: 'BDT 3,000 - BDT 6,000',
//       percentage: 20,
//     },
//     {
//       label: 'Mobile/Internet',
//       range: 'BDT 500 - BDT 1,500',
//       percentage: 10,
//     },
//     {
//       label: 'Books & Supplies',
//       range: 'BDT 1,000 - BDT 3,000',
//       percentage: 10,
//     },
//     {
//       label: 'Entertainment',
//       range: 'BDT 2,000 - BDT 5,000',
//       percentage: 15,
//     },
//   ],
//   regionalCosts: [
//     {
//       region: 'Dhaka',
//       level: 'Expensive',
//       color: 'text-red-500',
//       range: 'BDT 30,000 - BDT 50,000',
//     },
//     {
//       region: 'Chittagong',
//       level: 'Moderate',
//       color: 'text-orange-500',
//       range: 'BDT 20,000 - BDT 35,000',
//     },
//     {
//       region: 'Rajshahi',
//       level: 'Affordable',
//       color: 'text-yellow-500',
//       range: 'BDT 15,000 - BDT 25,000',
//     },
//     {
//       region: 'Sylhet',
//       level: 'Low Cost',
//       color: 'text-green-500',
//       range: 'BDT 10,000 - BDT 20,000',
//     },
//   ],
//   scholarships: [
//     {
//       category: 'Government Scholarships',
//       color: 'indigo',
//       items: [
//         {
//           title: 'SAARC Scholarships',
//           description:
//             'Fully-funded for SAARC country students, covering tuition and living costs.',
//         },
//         {
//           title: 'Prime Minister’s Education Assistance',
//           description:
//             'Merit-based funding for international students in select fields.',
//         },
//       ],
//     },
//     {
//       category: 'University Scholarships',
//       color: 'blue',
//       items: [
//         {
//           title: 'Merit-Based Scholarships',
//           description:
//             'Awards for academic excellence, covering 20–100% of tuition.',
//         },
//         {
//           title: 'International Student Grants',
//           description: 'Targeted at students from developing nations.',
//         },
//         {
//           title: 'Research Fellowships',
//           description:
//             'For postgraduate research students, often with stipends.',
//         },
//       ],
//     },
//   ],
//   financialSupports: [
//     {
//       title: 'Part-Time Work',
//       description: 'Limited to on-campus jobs, up to 20 hours/week.',
//     },
//     {
//       title: 'Internships',
//       description: 'Course-related internships, often unpaid or stipend-based.',
//     },
//     {
//       title: 'Research Assistantships',
//       description: 'Paid roles for postgraduate students.',
//     },
//     {
//       title: 'Student Loans',
//       description: 'Limited private loan options for international students.',
//     },
//   ],
//   TipsforScholarship: [
//     'Apply 4–6 months before intake',
//     'Check eligibility on university and UGC websites',
//     'Highlight academic and leadership achievements',
//     'Secure strong academic or professional references',
//   ],
//   bangladeshVisaData: {
//     title: 'Bangladesh Student Visa Requirements',
//     intro:
//       'International students need a student visa to study in Bangladesh for courses longer than 6 months.',
//     sections: [
//       {
//         title: 'Basic Requirements',
//         color: '#3B82F6',
//         items: [
//           'Admission letter from a recognized university',
//           'Valid passport (minimum 6 months validity)',
//           'Proof of financial support for tuition and living expenses',
//           'Passport-sized photographs',
//           'English proficiency test results (if applicable)',
//           'Medical certificate',
//           'Police clearance certificate (if required)',
//           'Visa application form',
//         ],
//       },
//       {
//         title: 'Financial Requirements',
//         color: '#F59E0B',
//         items: [
//           'Tuition fees for first year',
//           'Living expenses: BDT 20,000–40,000/month',
//           'Bank statement showing sufficient funds',
//           'Funds must be held for 30 days before application',
//         ],
//       },
//     ],
//     facts: [
//       'Visa fee: BDT 5,000–10,000 (varies by country)',
//       'Processing time: 2–4 weeks',
//       'Visa extensions available in-country',
//     ],
//     benefits: [
//       {
//         title: 'Limited Work Rights',
//         description: 'On-campus jobs up to 20 hours/week.',
//       },
//       {
//         title: 'Cultural Access',
//         description: 'Participate in local festivals and cultural events.',
//       },
//       {
//         title: 'Affordable Living',
//         description: 'Low-cost living compared to Western countries.',
//       },
//     ],
//   },
//   visaStepsData: [
//     {
//       step: '1',
//       title: 'Secure Admission',
//       color: 'bg-blue-500',
//       content:
//         'Receive and accept an offer from a recognized Bangladeshi university.',
//     },
//     {
//       step: '2',
//       title: 'Gather Documents',
//       color: 'bg-indigo-500',
//       content:
//         'Prepare passport, admission letter, financial proof, and photos.',
//     },
//     {
//       step: '3',
//       title: 'Apply at Embassy',
//       color: 'bg-purple-500',
//       content: 'Submit visa application at Bangladesh embassy in your country.',
//     },
//     {
//       step: '4',
//       title: 'Pay Visa Fee',
//       color: 'bg-pink-500',
//       content: 'Pay the visa fee (BDT 5,000–10,000, varies by country).',
//     },
//     {
//       step: '5',
//       title: 'Attend Interview',
//       color: 'bg-red-500',
//       content: 'Attend an interview if required by the embassy.',
//     },
//     {
//       step: '6',
//       title: 'Medical Check',
//       color: 'bg-orange-500',
//       content: 'Complete a medical examination if requested.',
//     },
//     {
//       step: '7',
//       title: 'Await Decision',
//       color: 'bg-amber-500',
//       content: 'Visa processing typically takes 2–4 weeks.',
//     },
//     {
//       step: '8',
//       title: 'Travel & Extend',
//       color: 'bg-green-500',
//       content: 'Travel to Bangladesh and extend visa if needed.',
//     },
//   ],
//   workOpportunitiesData: [
//     {
//       title: 'During Studies',
//       color: 'bg-indigo-500',
//       sections: [
//         {
//           heading: 'Working Hours',
//           points: [
//             'Up to 20 hours/week on-campus',
//             'No off-campus work allowed',
//             'Internships included in courses',
//             'Volunteering opportunities',
//           ],
//         },
//         {
//           heading: 'Common Student Jobs',
//           points: [
//             'Teaching assistants',
//             'Library aides',
//             'Campus event staff',
//             'NGO volunteering',
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Post-Graduation',
//       color: 'bg-green-500',
//       sections: [
//         {
//           heading: 'Work Permit',
//           points: [
//             'Requires job offer',
//             'Limited duration (1–2 years)',
//             'No automatic post-study visa',
//             'Apply through Immigration Office',
//           ],
//         },
//         {
//           heading: 'Employment Options',
//           points: [
//             'NGOs and development sector',
//             'IT and software firms',
//             'Teaching positions',
//             'Textile industry roles',
//           ],
//         },
//       ],
//     },
//   ],
//   jobMarketData: {
//     sectors: [
//       'Information Technology',
//       'NGO & Development',
//       'Textile & Garments',
//       'Education',
//       'Finance',
//       'Agriculture',
//     ],
//     salaries: [
//       'Dhaka: BDT 30,000 - BDT 50,000',
//       'Chittagong: BDT 25,000 - BDT 40,000',
//       'IT sector: BDT 40,000 - BDT 60,000',
//       'NGOs: BDT 35,000 - BDT 55,000',
//       'Education: BDT 25,000 - BDT 45,000',
//     ],
//   },
//   bestCitiesData: [
//     {
//       city: 'Dhaka',
//       image:
//         'https://images.unsplash.com/photo-1560155016-bd7a2dec8018?q=80&w=600&auto=format',
//       universities: '20+ universities',
//       description:
//         'The bustling capital with top universities and vibrant urban life.',
//       highlights: [
//         'Academic hub',
//         'Cultural events',
//         'Job opportunities',
//         'Urban lifestyle',
//       ],
//     },
//     {
//       city: 'Chittagong',
//       image:
//         'https://images.unsplash.com/photo-1588681665399-96a88c3460b7?q=80&w=600&auto=format',
//       universities: '5 universities',
//       description: 'Coastal city with business focus and scenic beauty.',
//       highlights: [
//         'Port city',
//         'Affordable living',
//         'Beaches nearby',
//         'Business programs',
//       ],
//     },
//     {
//       city: 'Rajshahi',
//       image:
//         'https://images.unsplash.com/photo-1593697821159-ce58f3a61c88?q=80&w=600&auto=format',
//       universities: '3 universities',
//       description: 'Quiet educational city with historical sites.',
//       highlights: [
//         'Low-cost living',
//         'Historical landmarks',
//         'Green environment',
//         'Academic focus',
//       ],
//     },
//     {
//       city: 'Sylhet',
//       image:
//         'https://images.unsplash.com/photo-1627819643013-d9d5a79981b8?q=80&w=600&auto=format',
//       universities: '4 universities',
//       description: 'Scenic city with tea gardens and a relaxed vibe.',
//       highlights: [
//         'Natural beauty',
//         'Cultural festivals',
//         'Affordable',
//         'Peaceful study',
//       ],
//     },
//     {
//       city: 'Khulna',
//       image:
//         'https://images.unsplash.com/photo-1560155016-bd7a2dec8018?q=80&w=600&auto=format',
//       universities: '2 universities',
//       description: 'Industrial city near Sundarbans with technical programs.',
//       highlights: [
//         'Eco-tourism',
//         'Engineering focus',
//         'Low costs',
//         'River life',
//       ],
//     },
//     {
//       city: 'Barisal',
//       image:
//         'https://images.unsplash.com/photo-1560155016-bd7a2dec8018?q=80&w=600&auto=format',
//       universities: '1 university',
//       description: 'Riverine city with a calm atmosphere for study.',
//       highlights: [
//         'Rivers and boats',
//         'Low-cost living',
//         'Local culture',
//         'Quiet environment',
//       ],
//     },
//   ],
//   studentLifeData: {
//     title: 'Student Life and Support Services',
//     icon: {
//       bg: 'bg-purple-100',
//       color: 'text-purple-600',
//     },
//     sections: [
//       {
//         title: 'Campus Life',
//         bg: 'bg-purple-50',
//         border: 'border-purple-100',
//         textColor: 'text-purple-800',
//         items: [
//           {
//             title: 'Student Unions',
//             description: 'Organize events, advocacy, and student support.',
//           },
//           {
//             title: 'Clubs & Societies',
//             description: 'Cultural, academic, and sports clubs for engagement.',
//           },
//           {
//             title: 'Sports Facilities',
//             description: 'Cricket, football, and indoor game facilities.',
//           },
//           {
//             title: 'Events & Festivals',
//             description: 'Cultural fests, Pohela Boishakh, and orientations.',
//           },
//         ],
//       },
//       {
//         title: 'Support Services',
//         bg: 'bg-blue-50',
//         border: 'border-blue-100',
//         textColor: 'text-blue-800',
//         items: [
//           {
//             title: 'International Student Office',
//             description:
//               'Support for visas, academics, and cultural adjustment.',
//           },
//           {
//             title: 'Counseling Services',
//             description: 'Mental health and wellbeing support.',
//           },
//           {
//             title: 'Career Services',
//             description: 'Internships, job fairs, and career guidance.',
//           },
//           {
//             title: 'Academic Support',
//             description: 'Tutoring, writing help, and language classes.',
//           },
//         ],
//       },
//       {
//         title: 'Accommodation Options',
//         bg: 'bg-green-50',
//         border: 'border-green-100',
//         textColor: 'text-green-800',
//         items: [
//           {
//             title: 'On-Campus Halls',
//             description: 'University-managed dorms with basic amenities.',
//             badges: ['Affordable', 'Convenient', 'Social'],
//           },
//           {
//             title: 'Private Hostels',
//             description: 'Off-campus student housing with meals.',
//             badges: ['Independent', 'Modern', 'Community'],
//           },
//           {
//             title: 'Shared Apartments',
//             description: 'Rentals shared with other students.',
//             badges: ['Flexible', 'Low cost', 'City life'],
//           },
//           {
//             title: 'Homestay',
//             description: 'Live with local families for cultural immersion.',
//             badges: ['Cultural', 'Supportive', 'Home-like'],
//           },
//         ],
//       },
//       {
//         title: 'Transportation',
//         bg: 'bg-amber-50',
//         border: 'border-amber-100',
//         textColor: 'text-amber-800',
//         items: [
//           {
//             title: 'Public Transport',
//             description: 'Buses and rickshaws with student discounts.',
//           },
//           {
//             title: 'Cycling/Walking',
//             description: 'Common for campus proximity.',
//           },
//           {
//             title: 'Rickshaws/Autos',
//             description: 'Affordable local transport options.',
//           },
//           {
//             title: 'University Shuttles',
//             description: 'Some universities provide campus buses.',
//           },
//         ],
//       },
//     ],
//     additionalInfo: {
//       title: 'Healthcare for International Students',
//       description:
//         'Health insurance is recommended. Universities offer clinics; private hospitals are accessible for major treatments.',
//       items: [
//         {
//           title: 'Covered Services',
//           points: [
//             'Basic consultations',
//             'Emergency care',
//             'Vaccinations',
//             'Some medications',
//           ],
//         },
//         {
//           title: 'Additional Costs',
//           points: [
//             'Dental care',
//             'Specialist consultations',
//             'Hospital stays',
//             'Insurance premiums',
//           ],
//         },
//       ],
//     },
//   },
//   latestUpdates2025: [
//     {
//       title: 'Expanded SAARC Scholarships',
//       description: 'Increased funding for regional students',
//       content:
//         'In 2025, Bangladesh expanded SAARC scholarships, offering more opportunities in IT, engineering, and development studies.',
//       category: 'Scholarships',
//       gradient: 'from-amber-50 to-yellow-50',
//       border: 'border-amber-100',
//       badgeColor: 'bg-amber-500',
//       titleColor: 'text-amber-800',
//     },
//     {
//       title: 'Digital Visa Processing',
//       description: 'Streamlined applications',
//       content:
//         'Bangladesh introduced online visa applications, reducing processing times to 2–4 weeks.',
//       category: 'Visa Policy',
//       gradient: 'from-blue-50 to-sky-50',
//       border: 'border-blue-100',
//       badgeColor: 'bg-blue-500',
//       titleColor: 'text-blue-800',
//     },
//     {
//       title: 'More English Programs',
//       description: 'Expanded offerings',
//       content:
//         'Private universities added more English-taught programs in business, IT, and engineering.',
//       category: 'Education',
//       gradient: 'from-purple-50 to-pink-50',
//       border: 'border-purple-100',
//       badgeColor: 'bg-purple-500',
//       titleColor: 'text-purple-800',
//     },
//     {
//       title: 'Campus Upgrades',
//       description: 'Modern facilities',
//       content:
//         'Investments in dorms, labs, and digital resources for better student experience.',
//       category: 'Infrastructure',
//       gradient: 'from-green-50 to-emerald-50',
//       border: 'border-green-100',
//       badgeColor: 'bg-green-500',
//       titleColor: 'text-green-800',
//     },
//   ],
//   policyChanges2025: [
//     {
//       title: 'Simplified Visa Extensions',
//       content: 'Easier in-country visa renewals for students.',
//     },
//     {
//       title: 'Higher Financial Proof',
//       content:
//         'Increased financial requirements due to inflation (BDT 20,000–40,000/month).',
//     },
//     {
//       title: 'Post-Study Work Pilot',
//       content: 'Trial work permits for graduates in IT and NGOs.',
//     },
//   ],
//   resourcecards: [
//     {
//       title: 'Course Finder',
//       description:
//         'Search courses by subject, location, and requirements across Bangladeshi universities.',
//       buttonText: 'Find Your Course',
//       gradient: 'from-blue-50 to-indigo-50',
//       borderColor: 'border-blue-100',
//       textColor: 'text-blue-800',
//       buttonColor: 'bg-blue-600 hover:bg-blue-700',
//     },
//     {
//       title: 'University Rankings',
//       description: 'Compare universities by academic quality and facilities.',
//       buttonText: 'View Rankings',
//       gradient: 'from-purple-50 to-fuchsia-50',
//       borderColor: 'border-purple-100',
//       textColor: 'text-purple-800',
//       buttonColor: 'bg-purple-600 hover:bg-purple-700',
//     },
//     {
//       title: 'Visa Checklist',
//       description: 'Guide to prepare documents for Bangladesh student visa.',
//       buttonText: 'Get Checklist',
//       gradient: 'from-green-50 to-emerald-50',
//       borderColor: 'border-green-100',
//       textColor: 'text-green-800',
//       buttonColor: 'bg-green-600 hover:bg-green-700',
//     },
//   ],
//   resourceofficialLinks: [
//     {
//       label: 'University Grants Commission Bangladesh',
//       href: '#',
//     },
//     {
//       label: 'Department of Immigration & Passports',
//       href: '#',
//     },
//     {
//       label: 'Ministry of Education',
//       href: '#',
//     },
//     {
//       label: 'Bangladesh Qualification Framework',
//       href: '#',
//     },
//     {
//       label: 'Study in Bangladesh Portal',
//       href: '#',
//     },
//   ],
//   resourceguides: [
//     {
//       label: 'Bangladesh University Application Guide (PDF)',
//       href: '#',
//     },
//     {
//       label: 'Student Visa Guide (PDF)',
//       href: '#',
//     },
//     {
//       label: 'Living in Bangladesh Guide (PDF)',
//       href: '#',
//     },
//     {
//       label: 'Scholarship Application Guide (PDF)',
//       href: '#',
//     },
//     {
//       label: 'Pre-departure Checklist (PDF)',
//       href: '#',
//     },
//   ],
//   resourcetools: [
//     {
//       title: 'Cost Calculator',
//       description: 'Estimate study and living costs in Bangladesh.',
//       buttonText: 'Calculate Costs',
//     },
//     {
//       title: 'Scholarship Matcher',
//       description: 'Find scholarships matching your profile.',
//       buttonText: 'Find Scholarships',
//     },
//     {
//       title: 'Document Checker',
//       description: 'Verify documents for visa and admission.',
//       buttonText: 'Check Documents',
//     },
//   ],
//   faqs: [
//     {
//       question: 'How long does a Bangladesh student visa take to process?',
//       answer:
//         'Visa processing takes 2–4 weeks. Apply at least 2 months before your course starts to avoid delays.',
//     },
//     {
//       question: 'Can I work while studying in Bangladesh?',
//       answer:
//         'Yes, up to 20 hours/week on-campus. Off-campus work is not permitted under student visa conditions.',
//     },
//     {
//       question: 'What English language tests are accepted?',
//       answer:
//         'IELTS, TOEFL, and PTE are accepted. Undergraduate programs require IELTS 5.5–6.5; postgraduate programs require 6.0–7.0.',
//     },
//     {
//       question: 'How much does it cost to study in Bangladesh?',
//       answer:
//         'Tuition ranges from BDT 100,000–500,000/year for undergraduates and BDT 150,000–600,000 for postgraduates. Living expenses are BDT 20,000–40,000/month.',
//     },
//     {
//       question: 'What scholarships are available for international students?',
//       answer:
//         'SAARC Scholarships, Prime Minister’s Education Assistance, university merit-based awards, and research fellowships are available.',
//     },
//     {
//       question: 'Can I stay in Bangladesh after completing my studies?',
//       answer:
//         'No automatic post-study work visa exists. You may apply for a work permit with a job offer, typically for 1–2 years.',
//     },
//     {
//       question:
//         'What are the application deadlines for Bangladeshi universities?',
//       answer:
//         'Undergraduate deadlines are November 1 (January intake) and May 1 (July intake). Postgraduate deadlines vary, typically 2–4 months before intake.',
//     },
//     {
//       question: 'Do I need health insurance to study in Bangladesh?',
//       answer:
//         'Health insurance is recommended. University clinics provide basic care, but private insurance is advised for major treatments.',
//     },
//     {
//       question: 'How do I open a bank account in Bangladesh?',
//       answer:
//         'You need a passport, visa, admission letter, and proof of address. Banks like BRAC Bank and Islami Bank offer student accounts.',
//     },
//     {
//       question:
//         'What support services are available for international students?',
//       answer:
//         'Universities offer international offices, counseling, career services, academic support, and student unions for cultural and social engagement.',
//     },
//   ],
// };
// async function main() {
//   try {
//     await mongoose.connect(MONGO_URL);
//     console.log('✅ Connected to DB');

//     // Insert one new document
//     const result = await Country.create(bangladeshData);
//     console.log('✅ Data inserted:', result);
//   } catch (err) {
//     console.error('❌ Error inserting document:', err.message);
//   } finally {
//     await mongoose.connection.close();
//     console.log('🔌 Connection closed');
//   }
// }

// main();
