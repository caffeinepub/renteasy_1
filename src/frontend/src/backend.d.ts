import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface OrderRecord {
    rental: string;
    status: string;
    buyerEmail: string;
    buyerAddress: string;
    createdAt: Time;
    buyerPhone: string;
    buyer: Principal;
}
export interface UserProfile {
    name: string;
}
export interface Rental {
    title: string;
    createdAt: Time;
    createdBy: Principal;
    description: string;
    category: string;
    image: ExternalBlob;
    phone: string;
    price?: bigint;
    location: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptOrder(orderId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(rentalTitle: string, buyerPhone: string, buyerEmail: string, buyerAddress: string): Promise<bigint>;
    createRental(title: string, category: string, description: string, price: bigint | null, location: string, phone: string, image: ExternalBlob): Promise<string>;
    deleteOrder(orderId: bigint): Promise<void>;
    deleteRental(title: string): Promise<void>;
    getBuyerOrders(): Promise<Array<[bigint, OrderRecord, ExternalBlob, string, bigint | null]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: bigint): Promise<OrderRecord>;
    getOwnerOrders(): Promise<Array<[bigint, OrderRecord, string, Principal, string, string, string]>>;
    getRental(title: string): Promise<Rental>;
    getRentals(page: bigint, pageSize: bigint): Promise<Array<Rental>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRentals(searchTerm: string): Promise<[bigint, Array<Rental>]>;
    updateRental(title: string, category: string, description: string, price: bigint | null, location: string, phone: string, image: ExternalBlob): Promise<Rental>;
}
