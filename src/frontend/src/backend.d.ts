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
    buyerName: string;
    createdAt: Time;
    buyerPhone: string;
    buyer: Principal;
    duration: string;
    totalPrice: bigint;
    startDate: Time;
    endDate: Time;
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
    latitude?: number;
    longitude?: number;
}
export interface Review {
    rental: string;
    reviewer: Principal;
    rating: bigint;
    reviewText: string;
    createdAt: Time;
}
export interface Notification {
    user: Principal;
    message: string;
    relatedOrder: bigint;
    isRead: boolean;
    createdAt: Time;
}
export interface SearchHistory {
    user: Principal;
    searchText: string;
    createdAt: Time;
}
export interface Report {
    reporter: Principal;
    reportedUser: Principal;
    rental: string;
    reason: string;
    createdAt: Time;
}
export interface Block {
    user: Principal;
    blockedUser: Principal;
}
export interface Favorite {
    user: Principal;
    rental: string;
    createdAt: Time;
}
export interface Negotiation {
    rental: string;
    buyer: Principal;
    offerPrice: bigint;
    message: string;
    status: string;
    createdAt: Time;
}
export interface Cart {
    user: Principal;
    rental: string;
    createdAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptOrder(orderId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(rentalTitle: string, buyerPhone: string, buyerEmail: string, buyerAddress: string, buyerName: string, duration: string, totalPrice: bigint, startDate: bigint, endDate: bigint): Promise<bigint>;
    createRental(title: string, category: string, description: string, price: bigint | null, location: string, phone: string, image: ExternalBlob, latitude: number | null, longitude: number | null): Promise<string>;
    createReview(rentalTitle: string, rating: bigint, reviewText: string): Promise<bigint>;
    deleteOrder(orderId: bigint): Promise<void>;
    deleteRental(title: string): Promise<void>;
    getBuyerOrders(): Promise<Array<[bigint, OrderRecord, ExternalBlob, string, bigint | null]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyNotifications(): Promise<Array<[bigint, Notification]>>;
    getOrder(orderId: bigint): Promise<OrderRecord>;
    getOwnerOrders(): Promise<Array<[bigint, OrderRecord, string, Principal, string, string, string]>>;
    getOwnerProfileOrders(): Promise<Array<[bigint, OrderRecord, Rental]>>;
    getMyRentals(): Promise<Array<Rental>>;
    getRental(title: string): Promise<Rental>;
    getRentals(page: bigint, pageSize: bigint): Promise<Array<Rental>>;
    getReviewsForRental(rentalTitle: string): Promise<Array<[bigint, Review, string]>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserReviewedRental(rentalTitle: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationRead(notifId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRentals(searchTerm: string): Promise<[bigint, Array<Rental>]>;
    updateRental(title: string, category: string, description: string, price: bigint | null, location: string, phone: string, image: ExternalBlob): Promise<Rental>;
    addFavorite(rentalTitle: string): Promise<bigint>;
    removeFavorite(rentalTitle: string): Promise<void>;
    isFavorited(rentalTitle: string): Promise<boolean>;
    getUserFavorites(): Promise<Array<[bigint, Favorite, Rental]>>;
    saveSearchHistory(searchText: string): Promise<bigint>;
    getMySearchHistory(): Promise<Array<[bigint, SearchHistory]>>;
    createReport(rentalTitle: string, reportedUser: Principal, reason: string): Promise<bigint>;
    blockUser(blockedUser: Principal): Promise<void>;
    unblockUser(blockedUser: Principal): Promise<void>;
    isUserBlocked(blockedUser: Principal): Promise<boolean>;
    getBlockedUsers(): Promise<Array<Principal>>;
    saveMyLocation(location: string): Promise<void>;
    getMyLocation(): Promise<string | null>;
    createNegotiation(rentalTitle: string, offerPrice: bigint, message: string): Promise<bigint>;
    getOwnerNegotiations(): Promise<Array<[bigint, Negotiation, Rental]>>;
    getBuyerNegotiations(): Promise<Array<[bigint, Negotiation, Rental]>>;
    respondToNegotiation(negotiationId: bigint, status: string): Promise<void>;
    addToCart(rentalTitle: string): Promise<bigint>;
    removeFromCart(cartId: bigint): Promise<void>;
    getMyCart(): Promise<Array<[bigint, Cart, Rental]>>;
    isInCart(rentalTitle: string): Promise<boolean>;
    cancelOrder(orderId: bigint): Promise<void>;
}
