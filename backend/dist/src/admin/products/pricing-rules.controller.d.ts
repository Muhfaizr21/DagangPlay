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
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            image: string | null;
            sortOrder: number;
            isActive: boolean;
            icon: string | null;
            parentId: string | null;
            digiflazzCategory: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
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
