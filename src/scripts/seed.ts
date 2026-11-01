import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Studio } from '../models/Studio';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studiospace';

export const initialStudios = [
  {
    title: 'The Apex White Cyc Wall & Daylight Stage',
    category: 'Photo Studio',
    hourlyRate: 85,
    securityDeposit: 150,
    maxCapacity: 20,
    location: 'Brooklyn, NY',
    address: '424 Broadway, Floor 4, Brooklyn, NY 11211',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '2-Wall Seamless Cyclorama',
      'Profoto B10X Strobes',
      'South-Facing Skylights',
      'Dressing & Vanity Station',
      '1Gbps Fiber Wi-Fi',
      'Heavy Duty C-Stands & Booms',
    ],
    overview:
      'A sprawling 2,800 sq ft corner daylight photo loft featuring a custom 25ft x 20ft double-corner infinity cyc wall. Engineered specifically for editorial fashion, lookbooks, high-end commercial campaigns, and music video visuals. Equipped with motorized blackout blinds, private client lounge, hair & makeup vanity mirrors, and steamer kit.',
    hostName: 'Elena Rostova',
    hostEmail: 'elena@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 4.96,
    reviewsCount: 38,
    isFeatured: true,
  },
  {
    title: 'Cinema 4 Sound Stage with Pre-Lit Grid',
    category: 'Film Stage',
    hourlyRate: 140,
    securityDeposit: 300,
    maxCapacity: 35,
    location: 'Queens, NY',
    address: '34-12 36th Street, Astoria, NY 11106',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Soundproofed Acoustic Shell',
      'Overhead Pipe Grid & DMX',
      '100A 3-Phase Camlock Power',
      'Drive-In Rollup Cargo Door',
      'Green Room & Production Office',
      'Ultra Chroma-Key Green Backdrops',
    ],
    overview:
      'Purpose-built cinema soundstage designed for narrative films, commercial spots, dialogue scenes, and virtual productions. Featuring NC-25 acoustic isolation, 16ft grid clearance, three-phase camlock distribution, drive-in vehicle bay, and attached dual green rooms.',
    hostName: 'Marcus Sterling',
    hostEmail: 'marcus@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 4.92,
    reviewsCount: 24,
    isFeatured: true,
  },
  {
    title: 'Aura 4-Mic 4K Broadcast Podcast Lounge',
    category: 'Podcast Lounge',
    hourlyRate: 65,
    securityDeposit: 100,
    maxCapacity: 8,
    location: 'Manhattan, NY',
    address: '135 W 29th Street, Suite 802, New York, NY 10001',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '4x Shure SM7B Microphones',
      'Rodecaster Pro II Audio Console',
      '3x Sony FX3 4K PTZ Camera Setup',
      'Aputure Soft Lantern Lighting',
      'Custom Walnut Acoustic Slat Wall',
      'Multi-Track Isolated Recording',
    ],
    overview:
      'Turnkey luxury podcast studio engineered for creator interviews, vodcasts, and livestreams. Includes warm ambient RGB accents, cinematic multi-cam switched angles, broadcast-grade audio processing, and an isolated technician control booth for instant card-dump deliveries.',
    hostName: 'Sarah Jenkins',
    hostEmail: 'sarah@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 4.98,
    reviewsCount: 52,
    isFeatured: true,
  },
  {
    title: 'Solarium Analog & Dolby Atmos Music Suite',
    category: 'Music Suite',
    hourlyRate: 110,
    securityDeposit: 250,
    maxCapacity: 12,
    location: 'Greenpoint, NY',
    address: '67 West Street, Unit 3B, Brooklyn, NY 11222',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Genelec 7.1.4 Dolby Atmos Rig',
      'Neve 1073 & Tube-Tech CL1B Preamps',
      'Yamaha U3 Upright Piano',
      'Vintage Roland & Moog Synthesizers',
      'Isolated Vocal & Drum Booth',
      'Universal Audio Apollo x16',
    ],
    overview:
      'Premier tracking and mixing haven tuned by acoustic master architects. Features a floating live room with a warm teak diffuser array, pristine signal chains including vintage Neumann mics and outboard analog compressors, plus an inspiring skyline view of the river.',
    hostName: 'David Chen',
    hostEmail: 'david@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 4.95,
    reviewsCount: 31,
    isFeatured: true,
  },
  {
    title: 'The Industrial Ceramic & Fine Art Atelier',
    category: 'Art Workshop',
    hourlyRate: 50,
    securityDeposit: 80,
    maxCapacity: 16,
    location: 'Long Island City, NY',
    address: '43-01 21st St, Studio 204, LIC, NY 11101',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '6x Shimpo Pottery Wheels',
      'Heavy Duty Clay Slab Roller',
      'Industrial Slop Sinks & Traps',
      'Northern Exposure Natural Light',
      'Solid Maple Communal Workbenches',
      'Clean Air Filtration & Ventilation',
    ],
    overview:
      'Bright open-concept fine art workshop outfitted for sculpting, ceramics, painting, printmaking, and creative masterclasses. Concrete polished floors, high ceilings, wash stations, drying racks, and ample storage for medium-to-large canvas productions.',
    hostName: 'Maya Lin',
    hostEmail: 'maya@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    rating: 4.88,
    reviewsCount: 19,
    isFeatured: true,
  },
  {
    title: 'Vanguard Sound Stage with Virtual LED Wall',
    category: 'Sound Stage',
    hourlyRate: 175,
    securityDeposit: 350,
    maxCapacity: 40,
    location: 'Jersey City, NJ',
    address: '150 Bay Street, Jersey City, NJ 07302',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '30ft Curved Roe Visual LED Volume',
      'Unreal Engine 5 Real-Time Tracking',
      'Full Sound Isolation Chamber',
      'High Output Silent HVAC',
      'Private Hair & Makeup Stalls',
      'Dedicated Rigging Crew Available',
    ],
    overview:
      'State-of-the-art virtual production soundstage engineered for immersive film environments, music videos, and commercial advertising. Features real-time camera tracking, in-camera VFX pipelines, motorized truss systems, and direct loading dock accessibility.',
    hostName: 'Liam O’Connor',
    hostEmail: 'liam@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    rating: 4.99,
    reviewsCount: 41,
    isFeatured: true,
  },
  {
    title: 'The Greenhouse Sunlit Editorial Photo Loft',
    category: 'Photo Studio',
    hourlyRate: 75,
    securityDeposit: 120,
    maxCapacity: 15,
    location: 'SoHo, NY',
    address: '568 Broadway, 11th Floor, New York, NY 10012',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Exposed Brick & Hardwood Floors',
      'Oversized Arched Factory Windows',
      'Designer Mid-Century Modern Furniture',
      'Colorama Seamless Paper Rolls (12+ Colors)',
      'High-Speed Tethering Carts',
      'Espresso & Coffee Bar Lounge',
    ],
    overview:
      'Charming sun-drenched loft in historic SoHo with all-day diffused natural light, exposed original brickwork, and curated designer furniture props. Ideal for portrait sessions, beauty campaigns, lifestyle shoots, and creative brand launches.',
    hostName: 'Chloe Dupont',
    hostEmail: 'chloe@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    rating: 4.91,
    reviewsCount: 29,
    isFeatured: false,
  },
  {
    title: 'Echo Chamber Live Tracking & Vocal Booth',
    category: 'Music Suite',
    hourlyRate: 90,
    securityDeposit: 200,
    maxCapacity: 10,
    location: 'Bushwick, NY',
    address: '1080 Wyckoff Ave, Studio C, Ridgewood, NY 11385',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Sony C800G & Neumann U87 Mics',
      'Pro Tools Ultimate HDX Rig',
      'Focal Trio11 Be Studio Monitors',
      'Custom Isolation Vocal Booth',
      'Private Host / Producer Lounge',
      'Zero-Latency Headphone Cue Mixes',
    ],
    overview:
      'Sonic sanctuary designed for pristine vocal recording, hip-hop/R&B sessions, songwriting camps, and modern pop mixing. Features elite tube microphones, ultra-quiet noise floor, and an inspiring visual aesthetic with dimmable amber mood lighting.',
    hostName: 'Jamal Harris',
    hostEmail: 'jamal@studiospace.io',
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    rating: 4.94,
    reviewsCount: 35,
    isFeatured: false,
  },
];

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Create default test examiner account
    const examinerEmail = 'examiner@studiospace.io';
    let examiner = await User.findOne({ email: examinerEmail });
    if (!examiner) {
      const hashedPassword = await bcrypt.hash('Test1234', 10);
      examiner = await User.create({
        name: 'Examiner Test User',
        email: examinerEmail,
        password: hashedPassword,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'host',
        provider: 'credentials',
      });
      console.log('[Seed] Created default examiner credentials: examiner@studiospace.io / Test1234');
    }

    // Clear existing seed studios
    await Studio.deleteMany({});
    console.log('[Seed] Cleared existing studios collection');

    // Insert rich seed workspaces
    const createdStudios = await Studio.insertMany(initialStudios);
    console.log(`[Seed] Successfully inserted ${createdStudios.length} creative studio workspaces!`);

    return { success: true, count: createdStudios.length };
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[Seed] Process finished.');
    process.exit(0);
  });
}
