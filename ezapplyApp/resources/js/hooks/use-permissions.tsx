import { usePage } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<{
        id: number;
        name: string;
        permissions: Array<{
            id: number;
            name: string;
        }>;
    }>;
}

interface PageProps {
    auth: {
        user: User;
    };
}

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const hasPermission = (permission: string): boolean => {
        if (!user || !user.roles) return false;
        
        return user.roles.some(role => 
            role.permissions.some(perm => perm.name === permission)
        );
    };

    const hasRole = (roleName: string): boolean => {
        if (!user || !user.roles) return false;
        
        return user.roles.some(role => role.name === roleName);
    };

    const hasAnyRole = (roleNames: string[]): boolean => {
        if (!user || !user.roles) return false;
        
        return user.roles.some(role => roleNames.includes(role.name));
    };

    const hasAllRoles = (roleNames: string[]): boolean => {
        if (!user || !user.roles) return false;
        
        return roleNames.every(roleName => 
            user.roles.some(role => role.name === roleName)
        );
    };

    const can = (permission: string): boolean => {
        return hasPermission(permission);
    };

    const isAdmin = (): boolean => {
        return hasRole('super_admin');
    };

    const isCompany = (): boolean => {
        return hasRole('company');
    };

    const isCustomer = (): boolean => {
        return hasRole('customer');
    };

    return {
        hasPermission,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        can,
        isAdmin,
        isCompany,
        isCustomer,
        user,
    };
}