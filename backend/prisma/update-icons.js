const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GAME_ICONS = [
    { key: 'mobile legends', icon: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' },
    { key: 'free fire', icon: 'https://cdn.unipin.com/images/icon_product_channels/1598282333-icon-ff.png' },
    { key: 'pubg', icon: 'https://cdn.unipin.com/images/icon_product_channels/1593414902-icon-pubgm.png' },
    { key: 'valorant', icon: 'https://cdn.unipin.com/images/icon_product_channels/1590981944-icon-valorant.png' },
    { key: 'genshin', icon: 'https://cdn.unipin.com/images/icon_product_channels/1601265630-icon-genshin.png' },
    { key: 'arena of valor', icon: 'https://cdn.unipin.com/images/icon_product_channels/1590983141-icon-aov.png' },
    { key: 'call of duty', icon: 'https://cdn.unipin.com/images/icon_product_channels/1593415033-icon-codm.png' },
    { key: 'point blank', icon: 'https://cdn.unipin.com/images/icon_product_channels/1590983344-icon-pb.png' },
    { key: 'stumble guys', icon: 'https://cdn.unipin.com/images/icon_product_channels/1655883201-icon-stumble-guys.png' },
    { key: 'honkai', icon: 'https://cdn.unipin.com/images/icon_product_channels/1682498725-icon-honkai-star-rail.png' },
    { key: 'apex legends', icon: 'https://cdn.unipin.com/images/icon_product_channels/1653118947-icon-apex-m.png' },
    { key: 'higgs domino', icon: 'https://cdn.unipin.com/images/icon_product_channels/1594924765-icon-higgs-domino.png' },
    { key: 'super sus', icon: 'https://cdn.unipin.com/images/icon_product_channels/1647416415-icon-super-sus.png' }
];

async function main() {
    console.log('🖼️ Starting icon update...');

    // 1. Update Categories
    const categories = await prisma.category.findMany();
    let catCount = 0;

    for (const cat of categories) {
        const match = GAME_ICONS.find(gi => cat.name.toLowerCase().includes(gi.key));
        if (match) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { image: match.icon, icon: match.icon }
            });
            catCount++;
        }
    }

    console.log(`✅ Updated ${catCount} categories.`);

    // 2. Update Products
    const products = await prisma.product.findMany();
    let prodCount = 0;

    for (const prod of products) {
        const match = GAME_ICONS.find(gi => prod.name.toLowerCase().includes(gi.key));
        if (match) {
            await prisma.product.update({
                where: { id: prod.id },
                data: { thumbnail: match.icon }
            });
            prodCount++;
        }
    }

    console.log(`✅ Updated ${prodCount} products.`);
    console.log('🎉 All icons updated!');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
