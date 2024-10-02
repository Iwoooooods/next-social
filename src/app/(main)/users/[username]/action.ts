"use server";

import { UpdateUserValues, updateUserSchema } from "@/lib/validation";
import { validateRequest } from "@/auth";
import { getUserDataSelect } from "@/lib/types";
import prisma from "@/lib/prisma";

export async function updateUserProfile(values: UpdateUserValues) {
    const validatedValues = updateUserSchema.parse(values);

    const {user} = await validateRequest();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: validatedValues,
        select: getUserDataSelect(user.id),
    });

    return updatedUser;
}