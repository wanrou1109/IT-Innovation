export const mockNFTs = {
    participation: [
        {
        id: 1,
        name: "Concert Ticket: Blackpink World Tour",
        artist: "Blackpink",
        event: "World Tour 2024",
        date: "2024-06-15",
        image: "/api/placeholder/150/150",
        rarity: "Rare",
        transferable: false,
        description: "Exclusive NFT ticket for Blackpink World Tour concert"
        },
        {
        id: 2,
        name: "Artist Collectible: BTS",
        artist: "BTS",
        event: "Permission to Dance Concert",
        date: "2024-05-20",
        image: "/api/placeholder/150/150",
        rarity: "Epic",
        transferable: true,
        description: "Special artist collectible NFT featuring BTS"
        },
        {
        id: 3,
        name: "Concert Ticket: Twice Encore",
        artist: "Twice",
        event: "Ready To Be Encore",
        date: "2024-07-10",
        image: "/api/placeholder/150/150",
        rarity: "Common",
        transferable: false,
        description: "Participation NFT for Twice Encore concert"
        },
        {
        id: 4,
        name: "Artist Collectible: Stray Kids",
        artist: "Stray Kids",
        event: "MANIAC World Tour",
        date: "2024-04-25",
        image: "/api/placeholder/150/150",
        rarity: "Rare",
        transferable: true,
        description: "Limited edition Stray Kids collectible NFT"
        },
        {
        id: 5,
        name: "Concert Ticket: Red Velvet Fan Meet",
        artist: "Red Velvet",
        event: "Fan Meeting 2024",
        date: "2024-08-05",
        image: "/api/placeholder/150/150",
        rarity: "Common",
        transferable: false,
        description: "Fan meeting participation NFT"
        },
        {
        id: 6,
        name: "Artist Collectible: ITZY",
        artist: "ITZY",
        event: "CHECKMATE World Tour",
        date: "2024-03-15",
        image: "/api/placeholder/150/150",
        rarity: "Epic",
        transferable: true,
        description: "Exclusive ITZY artist collectible NFT"
        }
    ],
    
    level: [
        {
        id: 7,
        name: "Concert Ticket: Blackpink World Tour",
        artist: "Blackpink",
        event: "World Tour 2024",
        date: "2024-06-15",
        image: "/api/placeholder/150/150",
        rarity: "Legendary",
        transferable: false,
        description: "Gold level achievement NFT",
        level: "Gold"
        },
        {
        id: 8,
        name: "Artist Collectible: BTS",
        artist: "BTS",
        event: "Permission to Dance Concert",
        date: "2024-05-20",
        image: "/api/placeholder/150/150",
        rarity: "Epic",
        transferable: false,
        description: "Silver level achievement NFT",
        level: "Silver"
        },
        {
        id: 9,
        name: "Concert Ticket: Twice Encore",
        artist: "Twice",
        event: "Ready To Be Encore",
        date: "2024-07-10",
        image: "/api/placeholder/150/150",
        rarity: "Rare",
        transferable: false,
        description: "Bronze level achievement NFT",
        level: "Bronze"
        }
    ],
    
    annual: [
        {
        id: 10,
        name: "Artist Collectible: ITZY",
        artist: "ITZY",
        event: "2024 Annual Collection",
        date: "2024-12-31",
        image: "/api/placeholder/150/150",
        rarity: "Legendary",
        transferable: true,
        description: "2024 Annual souvenir NFT collection",
        year: "2024"
        }
    ],
    
    milestone: [
        {
        id: 11,
        name: "Artist Collectible: ITZY",
        artist: "ITZY",
        event: "100 Shows Milestone",
        date: "2024-09-01",
        image: "/api/placeholder/150/150",
        rarity: "Legendary",
        transferable: false,
        description: "Special milestone reward for attending 100 shows",
        milestone: "100 Shows"
        }
    ]
    };

    // NFT 稀有度配置
    export const rarityConfig = {
    Common: {
        color: '#9CA3AF',
        backgroundColor: '#F3F4F6'
    },
    Rare: {
        color: '#3B82F6',
        backgroundColor: '#EBF4FF'
    },
    Epic: {
        color: '#8B5CF6',
        backgroundColor: '#F3E8FF'
    },
    Legendary: {
        color: '#F59E0B',
        backgroundColor: '#FEF3C7'
    }
    };

    // NFT 類別配置
    export const categoryConfig = {
    participation: {
        name: 'Participation Badge',
        icon: '🎫',
        description: 'NFTs earned by participating in concerts and events'
    },
    level: {
        name: 'Level Badge',
        icon: '⭐',
        description: 'NFTs representing your fan level achievements'
    },
    annual: {
        name: 'Annual Souvenir',
        icon: '🏆',
        description: 'Special NFTs commemorating each year'
    },
    milestone: {
        name: 'Milestone Reward',
        icon: '🎯',
        description: 'NFTs for reaching significant milestones'
    }
};