import { UserRole } from "@prisma/client";

export const isAdmin = (role: UserRole) => {
    return role === UserRole.admin;
}