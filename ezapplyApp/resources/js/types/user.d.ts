import { SingleRole } from "./role_permission";

export interface SingleUser{
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    email: string;
    roles: string; // Backend sends this as a comma-separated string
    created_at: string;
}

export interface User extends Pagination{
    links: Links[];
    to: number;
    from: number;
    total: number;
    data: SingleUser[];
}

export interface UserRole extends SingleUser{
    roles: SingleRole[];

}