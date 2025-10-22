"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRoom(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();

  const from = (formData.get("from") as string) || "/room";

  if (!name || name.length < 3 || name.length > 80) {
    return;
  }

  await prisma.room.create({
    data: { name, ownerId: user.id },
  });

  revalidatePath(from);
}

export async function joinRoom(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const roomId = formData.get("roomId") as string;
  if (!roomId) throw new Error("No roomId provided");

  await prisma.joinRequest.upsert({
    where: {
      roomId_requesterId: {
        roomId,
        requesterId: user.id,
      },
    },
    create: {
      roomId,
      requesterId: user.id,
      status: "PENDING",
    },
    update: {},
  });

  revalidatePath("/room");
}

export async function handleJoinRequest(
  requestId: string,
  action: "APPROVE" | "REJECT"
) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const jr = await prisma.joinRequest.findUnique({
    where: { id: requestId },
    include: { room: true },
  });

  if (!jr) throw new Error("JoinRequest not found");
  if (jr.room.ownerId !== user.id) throw new Error("Not room owner");

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      respondedAt: new Date(),
      respondedById: user.id,
    },
  });

  revalidatePath(`/room/${jr.roomId}`);
}

export async function approveJoinRequest(requestId: string, roomId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const jr = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!jr) throw new Error("Request not found");

  const room = await prisma.room.findUnique({ where: { id: jr.roomId } });
  if (!room || room.ownerId !== user.id) throw new Error("Forbidden");

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      respondedById: user.id,
      respondedAt: new Date(),
    },
  });

  revalidatePath(`/room/${roomId}`);
}

export async function rejectJoinRequest(requestId: string, roomId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const jr = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!jr) throw new Error("Request not found");

  const room = await prisma.room.findUnique({ where: { id: jr.roomId } });
  if (!room || room.ownerId !== user.id) throw new Error("Forbidden");

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      respondedById: user.id,
      respondedAt: new Date(),
    },
  });

  revalidatePath(`/room/${roomId}`);
}
