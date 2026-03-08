export declare enum AdminStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class CreateStaffDto {
    name: string;
    email: string;
    password: string;
    status?: AdminStatus;
    permissions?: string[];
}
export declare class UpdateStaffDto {
    name?: string;
    status?: AdminStatus;
    permissions?: string[];
}
