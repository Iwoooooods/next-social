"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getNotificationInclude } from "@/lib/types";

export async function deleteNotification(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const notification = await prisma.notification.findUnique({
    where: {
      id,
    },
  });

  if (!notification) throw new Error("Notification not found");

  if (notification.recipientId !== user.id) throw new Error("Unauthorized");

  const deletedNotification = await prisma.notification.delete({
    where: { id },
    include: getNotificationInclude(),
  });

  return deletedNotification;
}
