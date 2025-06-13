export const mockEvents = {
    upcoming: [
        {
        id: 1,
        title: 'ENHYPEN 2025 World Tour',
        artist: 'ENHYPEN',
        venue: 'Seoul Olympic Stadium, Seoul',
        date: '2024-08-15',
        time: '19:00',
        image: '/api/placeholder/400/250',
        price: {
            flt: 60,
            usd: 80
        },
        ticketTypes: ['VIP', 'Premium', 'General'],
        status: 'on_sale',
        description: 'Experience the electrifying performance of ENHYPEN in their world tour.',
        category: 'concert'
        },
        {
        id: 2,
        title: 'TWICE 2025 WORLD TOUR',
        artist: 'TWICE',
        venue: 'Tokyo Dome, Tokyo',
        date: '2024-08-20',
        time: '18:30',
        image: '/api/placeholder/400/250',
        price: {
            flt: 80,
            usd: 105
        },
        ticketTypes: ['VIP', 'Premium', 'General'],
        status: 'on_sale',
        description: 'A magical evening with TWICE.',
        category: 'concert'
        },
        {
        id: 3,
        title: 'UI 2025 concert',
        artist: 'UI',
        venue: 'Staples Center, Los Angeles',
        date: '2024-08-25',
        time: '20:00',
        image: '/api/placeholder/400/250',
        price: {
            flt: 75,
            usd: 95
        },
        ticketTypes: ['VIP', 'Premium', 'General'],
        status: 'on_sale',
        description: 'Stay with UI for an unforgettable night of music.',
        category: 'concert'
        },
        {
        id: 4,
        title: 'K-Pop Superstars Live in Concert',
        artist: 'Various Artists',
        venue: 'Seoul Arena, Seoul',
        date: '2024-07-15',
        time: '19:00',
        image: '/api/placeholder/400/250',
        price: {
            flt: 60,
            usd: 75
        },
        ticketTypes: ['VIP', 'General'],
        status: 'on_sale',
        description: 'A spectacular showcase featuring multiple K-pop superstars.',
        category: 'festival'
        },
        {
        id: 5,
        title: 'BTS World Tour',
        artist: 'BTS',
        venue: 'Olympic Gymnastics Arena, Seoul',
        date: '2024-09-10',
        time: '19:30',
        image: '/api/placeholder/400/250',
        price: {
            flt: 90,
            usd: 120
        },
        ticketTypes: ['VIP', 'Premium', 'General'],
        status: 'pre_sale',
        description: 'BTS brings their world tour to Seoul.',
        category: 'concert'
        }
    ],
    
    past: [
        {
        id: 101,
        title: 'Summer K-Pop Festival',
        artist: 'Various Artists',
        venue: 'Olympic Park, Seoul',
        date: '2024-06-20',
        time: '18:00',
        image: '/api/placeholder/400/250',
        price: {
            flt: 50,
            usd: 65
        },
        ticketTypes: ['VIP', 'General'],
        status: 'completed',
        description: 'Summer festival featuring top K-pop artists.',
        category: 'festival'
        },
        {
        id: 102,
        title: 'BTS Permission to Dance',
        artist: 'BTS',
        venue: 'SoFi Stadium, Los Angeles',
        date: '2024-05-15',
        time: '19:00',
        image: '/api/placeholder/400/250',
        price: {
            flt: 120,
            usd: 160
        },
        ticketTypes: ['VIP', 'Premium', 'General'],
        status: 'completed',
        description: 'BTS Permission to Dance concert series.',
        category: 'concert'
        }
    ]
    };

    // 藝人數據
    export const mockArtists = {
    featured: [
        {
        id: 1,
        name: 'ENHYPEN',
        fans: '5M fans',
        image: '/api/placeholder/120/120',
        genre: ['K-pop', 'Vampire'],
        description: 'K-pop band known for their powerful performances.',
        socialMedia: {
            instagram: '@enhypen_official',
            twitter: '@enhypen'
        }
        },
        {
        id: 2,
        name: 'TWICE',
        fans: '3M fans',
        image: '/api/placeholder/120/120',
        genre: ['K-pop', 'Energetic'],
        description: 'World-renowned k-pop group with modern interpretations.',
        socialMedia: {
            instagram: '@twice',
            twitter: '@twice'
        }
        },
        {
        id: 3,
        name: 'BTS',
        fans: '50M fans',
        image: '/api/placeholder/120/120',
        genre: ['K-Pop', 'Hip Hop'],
        description: 'Global K-pop sensation breaking barriers worldwide.',
        socialMedia: {
            instagram: '@bts.bighitofficial',
            twitter: '@BTS_twt'
        }
        },
        {
        id: 4,
        name: 'BLACKPINK',
        fans: '40M fans',
        image: '/api/placeholder/120/120',
        genre: ['K-Pop', 'Pop'],
        description: 'Iconic K-pop girl group with international acclaim.',
        socialMedia: {
            instagram: '@blackpinkofficial',
            twitter: '@BLACKPINK'
        }
        },
    ]
    };

    // 票券類型配置
    export const ticketTypes = {
    VIP: {
        name: 'VIP',
        benefits: [
        'Premium seating',
        'Meet & greet opportunity',
        'Exclusive merchandise',
        'Priority entry',
        'Commemorative NFT'
        ],
        color: '#F59E0B'
    },
    Premium: {
        name: 'Premium',
        benefits: [
        'Great seating',
        'Priority entry',
        'Digital program',
        'Commemorative NFT'
        ],
        color: '#8B5CF6'
    },
    General: {
        name: 'General',
        benefits: [
        'Standard seating',
        'Digital program',
        'Participation NFT'
        ],
        color: '#6B7280'
    }
    };

    // 活動狀態配置
    export const eventStatus = {
    pre_sale: {
        label: 'Pre-sale',
        color: '#F59E0B',
        description: 'Early access for members'
    },
    on_sale: {
        label: 'On Sale',
        color: '#10B981',
        description: 'Tickets available now'
    },
    sold_out: {
        label: 'Sold Out',
        color: '#EF4444',
        description: 'No tickets available'
    },
    completed: {
        label: 'Completed',
        color: '#6B7280',
        description: 'Event has ended'
    },
    cancelled: {
        label: 'Cancelled',
        color: '#EF4444',
        description: 'Event cancelled'
    }
    };

    // 場地數據
    export const venues = [
    {
        id: 1,
        name: 'Seoul Olympic Stadium',
        city: 'Seoul',
        country: 'South Korea',
        capacity: 69950,
        type: 'Stadium'
    },
    {
        id: 2,
        name: 'Tokyo Dome',
        city: 'Tokyo',
        country: 'Japan',
        capacity: 55000,
        type: 'Dome'
    },
    {
        id: 3,
        name: 'Staples Center',
        city: 'Los Angeles',
        country: 'USA',
        capacity: 20000,
        type: 'Arena'
    },
    {
        id: 4,
        name: 'Seoul Arena',
        city: 'Seoul',
        country: 'South Korea',
        capacity: 15000,
        type: 'Arena'
    }
    ];

    // 通知數據
    export const mockNotifications = [
    {
        id: 1,
        type: 'ticket_purchased',
        title: 'Ticket Purchased',
        message: 'NFT Rewards for Early Ticket Buyers - Reward early ticket buyers with exclusive NFT collectibles, enhancing their concert experience and fostering community engagement.',
        time: '2 hours ago',
        read: false,
        image: '/api/placeholder/300/200'
    },
    {
        id: 2,
        type: 'ticket_sold',
        title: 'Ticket Sold',
        message: 'Secondary Ticket Governance - Establish a decentralized governance system for secondary ticket sales, ensuring fair pricing and preventing scalping.',
        time: '1 day ago',
        read: false,
        image: '/api/placeholder/300/200'
    },
    {
        id: 3,
        type: 'ticket_purchased',
        title: 'Ticket Purchased',
        message: 'Community-Curated Playlists - Allow community members to submit and vote on songs for concert playlists, creating a more personalized and engaging experience.',
        time: '2 days ago',
        read: false,
        image: '/api/placeholder/300/200'
    },
    {
        id: 4,
        type: 'report_submission',
        title: 'Report Submission',
        message: 'Scalper Reporting System - Develop a system for reporting scalpers, with community votes determining penalties and blacklist status.',
        time: '3 days ago',
        read: true,
        image: '/api/placeholder/300/200'
    },
    {
        id: 5,
        type: 'event_announcement',
        title: "ENHYPEN's 2025 World Tour!",
        message: 'Enable users to check if a seller is on the community blacklist, promoting transparency and trust in the secondary market.',
        time: '1 week ago',
        read: true,
        image: '/api/placeholder/300/200'
    }
];