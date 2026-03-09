import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';
export declare class PricingRulesController {
    private readonly prisma;
    private readonly productsService;
    constructor(prisma: PrismaService, productsService: ProductsService);
    getCategoryRules(): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            image: string | null;
            description: string | null;
            sortOrder: number;
            isActive: boolean;
            parentId: string | null;
            digiflazzCategory: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        minMarginNormal: number;
        minMarginPro: number;
        minMarginLegend: number;
        minMarginSupreme: number;
        createdBy: string;
    })[]>;
    createCategoryRule(dto: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        minMarginNormal: number;
        minMarginPro: number;
        minMarginLegend: number;
        minMarginSupreme: number;
        createdBy: string;
    }>;
    updateCategoryRule(id: string, dto: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        minMarginNormal: number;
        minMarginPro: number;
        minMarginLegend: number;
        minMarginSupreme: number;
        createdBy: string;
    }>;
    deleteCategoryRule(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string | null;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        minMarginNormal: number;
        minMarginPro: number;
        minMarginLegend: number;
        minMarginSupreme: number;
        createdBy: string;
    }>;
    applyCategoryRule(categoryId: string, margins: any): Promise<{
        success: boolean;
        count: number;
    }>;
}
