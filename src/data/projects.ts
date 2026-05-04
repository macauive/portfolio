import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'amountly',
    title: 'Amountly',
    category: 'Product Development',
    technologies: ['Next.js', 'Vercel', 'TypeScript', 'AI-assisted UX'],
    description: 'AI-assisted accounting workspace for bills, expenses, invoices, and tax prep',
    detailedDescription: 'Built and deployed Amountly, a simple accounting workspace that keeps bills, expenses, invoices, and tax preparation organized around the next financial action. The product includes a clean workspace preview, financial search, task-oriented money workflows, and production deployment on Vercel at amountly.app.',
    achievements: [
      'Shipped a production SaaS-style landing and app entry point on Vercel',
      'Designed workflows around bills, expenses, invoices, tax records, and financial search',
      'Built a focused product narrative for reducing day-to-day accounting friction',
    ],
    featured: true,
    link: 'https://amountly.app',
  },
  {
    id: 'rescue-cooling-ai-lead-intelligence',
    title: 'AI Call Intelligence Pipeline',
    category: 'AI & Automation',
    technologies: ['OpenAI Whisper', 'GPT-4o Mini', 'Python', 'RingCentral', 'HubSpot'],
    description: 'AI pipeline that transcribes rental calls, scores lead quality, and updates HubSpot contacts',
    detailedDescription: 'Built an AI-assisted call intelligence pipeline that pulls RingCentral recordings, transcribes audio with OpenAI Whisper, analyzes transcripts with GPT-4o Mini, and writes lead score, service location, customer type, recording links, and transcript notes back into HubSpot. The workflow skips already-processed calls, maps internal phone numbers to staff and branch context, and avoids creating low-quality or non-lead records.',
    achievements: [
      'Automated RingCentral call transcription using OpenAI audio transcription',
      'Used GPT-4o Mini to classify lead quality, customer type, and service location from transcripts',
      'Synced scored leads, recordings, transcripts, and ownership context into HubSpot',
      'Added guardrails for duplicate calls, internal calls, non-leads, and invalid HubSpot location values',
    ],
    featured: true,
  },
  {
    id: 'verizon-ai-analysis',
    title: 'Verizon AI Analysis API',
    category: 'AI & Automation',
    technologies: ['AI/ML', 'Python', 'REST API', 'Django', 'Neural Networks'],
    description: 'ML-based PCAP file analysis system for telecom network anomaly detection',
    detailedDescription: 'Built an advanced REST API for analyzing PCAP files from telecom networks using multiple ML models including autoencoders and neural networks. The system performs comprehensive protocol analysis for GTP, SIP, S1AP, and Diameter protocols, providing automated anomaly detection and classification with detailed packet statistics and real-time status tracking.',
    achievements: [
      'Multi-model ML pipeline with autoencoder and neural network classification',
      'Protocol-specific analysis for GTP, SIP, S1AP, and Diameter protocols',
      'Automated anomaly detection with per-packet and per-protocol classification',
      'RESTful API with token authentication and comprehensive status tracking',
    ],
    featured: true,
    images: {
      screenshots: [
        '/images/projects/verizon-ai-analysis/dashboard.png',
        '/images/projects/verizon-ai-analysis/ai-analysis.png',
        '/images/projects/verizon-ai-analysis/api-docs.png',
      ],
    },
  },
  {
    id: 'erp-platform',
    title: 'Enterprise ERP Platform',
    category: 'Management & Manufacturing',
    technologies: ['Python', 'web2py', 'SQL', 'ZPL'],
    description: 'Comprehensive ERP system streamlining manufacturing operations and inventory management',
    detailedDescription: 'Designed and built a large-scale ERP platform that brings together APIs, warehouse management, EDI integration, automated labeling, and business intelligence. The system handles everything from purchase order receipt to work order management, providing real-time visibility across all manufacturing operations.',
    achievements: [
      'Automated workflows reducing manual data entry by 70%',
      'Integrated barcode scanning system for seamless inventory tracking',
      'Real-time visibility into production status across multiple facilities',
    ],
    featured: false,
  },
  {
    id: 'barcode-system',
    title: 'Automated Barcode Warehouse System',
    category: 'Management & Manufacturing',
    technologies: ['Python', 'ZPL', 'SQL'],
    description: 'Mobile-friendly barcode scanning solution for warehouse operations',
    detailedDescription: 'Built an automated barcode system that handles the complete warehouse workflow - from receiving purchase orders to transferring inventory and managing work orders. The system integrates with Zebra printers and handheld scanners to eliminate manual processes.',
    achievements: [
      'Reduced inventory check time by 60%',
      'Eliminated scanning errors through built-in validation',
      'Enabled multi-location inventory tracking across warehouses',
    ],
  },
  {
    id: 'idms-conversion',
    title: 'IDMS Loan Data Migration',
    category: 'Financial Systems',
    technologies: ['Python', 'pandas', 'SQL Server'],
    description: 'Automated migration of legacy loan data with data cleanup and validation',
    detailedDescription: 'Migrated legacy IDMS loan data into modern DealerSocket systems with comprehensive field mapping and data cleanup. Implemented automated reconciliation logic to ensure accuracy, along with QA checks and detailed audit logs for compliance.',
    achievements: [
      'Successfully migrated 100,000+ loan records with 100% accuracy',
      'Reduced manual conversion time from weeks to hours',
      'Automated validation with tight variance thresholds',
    ],
  },
  {
    id: 'amazon-integration',
    title: 'Amazon Vendor Direct Fulfillment',
    category: 'Integrations & APIs',
    technologies: ['Python', 'Amazon SP-API', 'FastAPI'],
    description: 'Automated shipment confirmations and order processing for Amazon Vendor',
    detailedDescription: 'Created a robust integration with Amazon Vendor Direct Fulfillment API that automates shipment confirmations with container details and tracking information. The system handles thousands of transactions daily with intelligent retry logic and error recovery.',
    achievements: [
      'Processes 10,000+ orders monthly without manual intervention',
      'Automated container packing and tracking number management',
      'Reduced shipment confirmation errors by 95%',
    ],
    featured: false,
  },
  {
    id: 'wayfair-integration',
    title: 'Wayfair GraphQL Integration',
    category: 'Integrations & APIs',
    technologies: ['Python', 'GraphQL', 'Django'],
    description: 'End-to-end order flow automation from acceptance to shipment notification',
    detailedDescription: 'Implemented complete Wayfair GraphQL integration orchestrating the full order lifecycle - from querying open orders to acceptance and shipment notifications. Enhanced validation logic to reduce false failures and improve order accuracy.',
    achievements: [
      'Reduced order processing time by 80%',
      'Automated catalog updates for 5,000+ SKUs',
      'Improved order accuracy to 99.5%',
    ],
  },
  {
    id: 'hubspot-crm',
    title: 'HubSpot CRM Integration',
    category: 'Integrations & APIs',
    technologies: ['Python', 'HubSpot API', 'Flask'],
    description: 'Two-way sync between ERP and CRM for unified customer data',
    detailedDescription: 'Built a bidirectional integration synchronizing customer data, orders, and interactions between internal ERP and HubSpot CRM. Ensures every deal has proper company and contact associations, with automated file attachments and activity normalization.',
    achievements: [
      'Eliminated duplicate data entry across systems',
      'Synced 50,000+ customer records with automated conflict resolution',
      'Real-time sales pipeline visibility for leadership team',
    ],
  },
  {
    id: 'ringcentral-integration',
    title: 'RingCentral Call Tracking',
    category: 'Integrations & APIs',
    technologies: ['Python', 'RingCentral API'],
    description: 'Automated call and SMS logging integrated with customer records',
    detailedDescription: 'Integrated RingCentral phone system to automatically capture call and SMS logs into internal systems for comprehensive activity tracking. Provides complete communication history linked to customer accounts.',
    achievements: [
      'Automated logging of 1,000+ calls per week',
      'Complete communication history for every customer',
      'Improved customer service response times by 40%',
    ],
  },
  {
    id: 'powerbi-dashboards',
    title: 'Executive Analytics Dashboards',
    category: 'Analytics & BI',
    technologies: ['Power BI', 'DAX', 'SQL Server'],
    description: 'Real-time business intelligence dashboards for sales, operations, and labor metrics',
    detailedDescription: 'Designed and deployed comprehensive Power BI dashboards providing executives with real-time insights into sales performance, inventory levels, production efficiency, and labor utilization. Includes advanced DAX calculations for week/month rollups and YTD trends.',
    achievements: [
      'Reduced reporting time from days to real-time',
      'Visualized 15+ critical business metrics in one place',
      'Enabled data-driven decision making across organization',
    ],
    featured: true,
    images: {
      screenshots: [
        '/images/projects/powerbi-dashboards/gross_sales_by_customer.png',
        '/images/projects/powerbi-dashboards/gross_sales_by_sku.png',
      ],
    },
  },
  {
    id: 'shopify-store',
    title: 'Shopify Multi-Brand E-commerce',
    category: 'E-commerce',
    technologies: ['Shopify', 'GraphQL', 'Python'],
    description: 'Automated inventory and pricing sync across multiple Shopify stores',
    detailedDescription: 'Implemented Shopify GraphQL integration for seamless multi-brand inventory and pricing synchronization. Handles per-location stock levels, automated price updates, and conflict resolution to keep all sales channels perfectly aligned.',
    achievements: [
      'Synchronized inventory across 5 Shopify stores in real-time',
      'Automated pricing updates preventing manual errors',
      'Reduced out-of-stock incidents by 85%',
    ],
  },
  {
    id: 'woocommerce-integration',
    title: 'WooCommerce Dealership Integration',
    category: 'E-commerce',
    technologies: ['WordPress', 'WooCommerce', 'PHP', 'Python'],
    description: 'Automated product, order, and inventory sync for dealership storefronts',
    detailedDescription: 'Created automated integration between WooCommerce stores and internal ERP systems, handling complex product variations, custom pricing rules, and dealership-specific inventory workflows. Provides seamless e-commerce experience for customers.',
    achievements: [
      'Processed 5,000+ orders monthly automatically',
      'Synchronized 3,000+ product variations',
      'Eliminated manual order entry errors completely',
    ],
  },
  {
    id: 'customer-portal',
    title: 'Customer Self-Service Portal',
    category: 'Internal Tools',
    technologies: ['Django', 'SQL', 'JavaScript'],
    description: 'Web portal for order tracking, invoice downloads, and account management',
    detailedDescription: 'Built a customer-facing portal where clients can track orders, view shipment status, download invoices, and manage account details 24/7. Significantly reduced customer service inquiries while improving customer satisfaction.',
    achievements: [
      'Reduced support tickets by 40%',
      'Enabled 24/7 self-service access for customers',
      'Improved customer satisfaction scores by 25%',
    ],
  },
  {
    id: 'internal-dashboard',
    title: 'Live Operations Dashboard',
    category: 'Internal Tools',
    technologies: ['web2py', 'JavaScript', 'DataTables'],
    description: 'Real-time monitoring dashboard with TV display mode for shipping area',
    detailedDescription: 'Created an internal dashboard providing real-time order status, due-today indicators, and system health monitoring. Features a dedicated TV display mode for the shipping area, giving teams instant visibility into priorities and bottlenecks.',
    achievements: [
      'Reduced incident response time by 60%',
      'Centralized monitoring of 10+ systems',
      'Improved team coordination with live status visibility',
    ],
  },
  {
    id: 'psychological-testing',
    title: 'Psychological Testing Platform',
    category: 'Product Development',
    technologies: ['Django', 'SQL', 'jQuery'],
    description: 'Multi-tenant platform for administering and scoring psychological assessments',
    detailedDescription: 'Developed a comprehensive platform for psychological testing including patient management, test administration, question batteries, automated scoring, and multi-tenant clinic settings. Built for resale with flexible configuration and robust security.',
    achievements: [
      'Administered 10,000+ assessments',
      'Automated complex scoring calculations and report generation',
      'Multi-tenant architecture supporting multiple clinics',
    ],
    featured: true,
    images: {
      screenshots: [
        '/images/projects/psychological-testing/select-patient.png',
        '/images/projects/psychological-testing/add-patient.png',
      ],
    },
  },
  {
    id: 'ai-chatbot',
    title: 'Dealership Inventory Chatbot',
    category: 'AI & Automation',
    technologies: ['Python', 'AI/ML'],
    description: 'Intelligent chatbot with search guardrails for vehicle inventory',
    detailedDescription: 'Built an AI-powered chatbot with constrained search capabilities for dealership inventory. Implements intelligent guardrails like monthly payment thresholds and price-ending exclusions to guide customers to appropriate vehicles.',
    achievements: [
      'Automated 60% of initial customer inquiries',
      'Improved lead quality with intelligent search constraints',
      'Reduced average response time from hours to seconds',
    ],
  },
  {
    id: 'selenium-automation',
    title: 'Data Capture Automation Suite',
    category: 'AI & Automation',
    technologies: ['Python', 'Selenium', 'SQL'],
    description: 'Scheduled exports from third-party systems with validation and notifications',
    detailedDescription: 'Created Selenium-based automation for scheduled data extraction from third-party vendor portals. Includes automated validation, MySQL loading, error notifications, and comprehensive audit logging.',
    achievements: [
      'Automated 20+ hours of weekly manual data entry',
      'Improved data accuracy by eliminating manual transcription',
      'Real-time error notifications for failed captures',
    ],
  },
  {
    id: 'network-infrastructure',
    title: 'Network Infrastructure Optimization',
    category: 'Infrastructure',
    technologies: ['Proxmox', 'pfSense', 'Networking'],
    description: 'Structured cabling, server installations, and network security enhancements',
    detailedDescription: 'Led network infrastructure projects including structured cabling installations, Proxmox host and storage planning, pfSense firewall configuration, and workspace migrations. Improved network reliability and security across multiple corporate locations.',
    achievements: [
      'Reduced network downtime by 90%',
      'Implemented secure remote access for 50+ users',
      'Completed infrastructure upgrades for multiple corporations',
    ],
  },
];

// Helper function to get unique categories
export const getProjectCategories = (): string[] => {
  const categories = projects.map((p) => p.category);
  return ['All', ...Array.from(new Set(categories))];
};

// Helper function to get unique technologies
export const getUniqueTechnologies = (): string[] => {
  const allTechs = projects.flatMap((p) => p.technologies);
  return Array.from(new Set(allTechs)).sort();
};
