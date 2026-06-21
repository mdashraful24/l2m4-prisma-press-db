export interface IUser {
    name: string;
    email: string;
    password: string;
    role?: string;
    is_active?: boolean;
    profilePhoto?: string;
    bio?: string;
}