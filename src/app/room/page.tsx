import AddRoom from "@/app/component/Room/AddRoom";
import RoomListItem from "@/app/component/Room/RoomListItem";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";

export const revalidate = 0;

export default async function RoomsPage() {
  const user = await currentUser();
  if (!user) {
    return <div style={{ padding: 20 }}>⛔ Please login</div>;
  }

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      joinRequests: {
        include: {
          requester: true,
        },
      },
    },
  });

  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <AddRoom />
      <ul style={{ display: "grid", gap: 16 }}>
        {rooms.map((room) => {
          const isOwner = room.ownerId === user.id;
          const isMember = room.joinRequests.some(
            (jr) => jr.requesterId === user.id && jr.status === "APPROVED"
          );
          const disableJoin = room.joinRequests.some(
            (jr) => jr.requesterId === user.id && jr.status === "PENDING"
          );

          return (
            <li key={room.id} style={{ listStyle: "none" }}>
              <RoomListItem
                id={room.id}
                name={room.name}
                ownerLabel={room.owner?.name ?? room.owner?.email}
                members={room.joinRequests
                  .filter((jr) => jr.status === "APPROVED")
                  .map((jr) => ({
                    id: jr.requester.id,
                    label: jr.requester.name ?? jr.requester.email,
                  }))}
                disableJoin={disableJoin}
                isOwner={isOwner}
                isMember={isMember}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
