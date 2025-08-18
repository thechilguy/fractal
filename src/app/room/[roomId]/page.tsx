import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import { notFound } from "next/navigation";
import { approveJoinRequest, rejectJoinRequest } from "@/actions/rooms";
import styles from "./RoomDetailPage.module.scss";

export default async function RoomDetailPage({
  params,
}: {
  params: { roomId: string };
}) {
  const user = await currentUser();
  if (!user) notFound();

  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: {
      owner: true,
      joinRequests: {
        include: {
          requester: true,
        },
      },
    },
  });

  if (!room) notFound();

  const isOwner = room.ownerId === user.id;
  const isMember =
    isOwner ||
    room.joinRequests.some(
      (jr) => jr.requesterId === user.id && jr.status === "APPROVED"
    );

  if (!isMember) {
    return <div className={styles.accessDenied}>⛔ Access denied</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.roomName}>{room.name}</h1>
      <p className={styles.owner}>
        Owner: <span>{room.owner?.name ?? room.owner?.email}</span>
      </p>

      {isOwner && (
        <section className={styles.joinRequests}>
          <h2>Join Requests</h2>
          {room.joinRequests.filter((jr) => jr.status === "PENDING").length ===
          0 ? (
            <p>No pending requests</p>
          ) : (
            <ul>
              {room.joinRequests
                .filter((jr) => jr.status === "PENDING")
                .map((jr) => (
                  <li key={jr.id} className={styles.requestItem}>
                    <span>{jr.requester.name ?? jr.requester.email}</span>
                    <div className={styles.actions}>
                      <form
                        action={approveJoinRequest.bind(null, jr.id, room.id)}
                      >
                        <button type="submit" className={styles.approve}>
                          Approve
                        </button>
                      </form>
                      <form
                        action={rejectJoinRequest.bind(null, jr.id, room.id)}
                      >
                        <button type="submit" className={styles.reject}>
                          Reject
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      <section className={styles.members}>
        <h2>Members</h2>
        <ul>
          <li className={styles.ownerMember}>
            {room.owner?.name ?? room.owner?.email} <span>(Owner)</span>
          </li>
          {room.joinRequests
            .filter((jr) => jr.status === "APPROVED")
            .map((jr) => (
              <li key={jr.id} className={styles.memberItem}>
                {jr.requester.name ?? jr.requester.email}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
