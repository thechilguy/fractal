import { prisma } from "@/lib/prisma";
import { currentUser } from "@/utils/auth";
import { notFound } from "next/navigation";
import { approveJoinRequest, rejectJoinRequest } from "@/actions/rooms";
import { subscribeTodo, unsubscribeTodo } from "@/actions/todo";
import AddTask from "@/app/component/AddTask/AddTask";
import TodoItem from "@/app/component/Todo/TodoItem";
import styles from "./RoomDetailPage.module.scss";

export const revalidate = 0;

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
      owner: { select: { name: true, email: true, id: true } },
      joinRequests: {
        include: {
          requester: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      todos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          isDone: true,
          createdAt: true,
          roomId: true,
          room: { select: { id: true, name: true } },
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

  const todoIds = room.todos.map((t) => t.id);
  const subs = await prisma.todoSubscription.findMany({
    where: { userId: user.id, todoId: { in: todoIds } },
    select: { todoId: true },
  });
  const followed = new Set(subs.map((s) => s.todoId));

  const approvedMembers = room.joinRequests.filter(
    (j) => j.status === "APPROVED"
  );
  const pendingRequests = room.joinRequests.filter(
    (j) => j.status === "PENDING"
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.roomName}>{room.name}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.badge}>
              Owner: {room.owner?.name ?? room.owner?.email}
            </span>
            <span className={styles.dot} aria-hidden="true">
              •
            </span>
            <span className={styles.badge}>
              Members: {approvedMembers.length + 1}
            </span>
            <span className={styles.dot} aria-hidden="true">
              •
            </span>
            <span className={styles.badge}>Tasks: {room.todos.length}</span>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <main className={styles.colMain}>
          <section className={styles.card}>
            <div className={styles.sectionHead}>
              <h2>Add Task to this room</h2>
              <span className={styles.caption}>
                Visible to owner & approved members
              </span>
            </div>
            <div className={styles.cardBody}>
              <AddTask roomId={room.id} />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHead}>
              <h2>Room Tasks</h2>
              <span className={styles.counter}>{room.todos.length}</span>
            </div>

            {room.todos.length === 0 ? (
              <div className={styles.empty}>No tasks yet</div>
            ) : (
              <ul className={styles.todoList} role="list">
                {room.todos.map((t) => {
                  const isFollowing = followed.has(t.id);
                  return (
                    <li key={t.id} className={styles.todoRow}>
                      <TodoItem todo={t as any} />
                      <div className={styles.follow}>
                        {!isFollowing ? (
                          <form action={subscribeTodo}>
                            <input type="hidden" name="todoId" value={t.id} />
                            <input
                              type="hidden"
                              name="from"
                              value={`/room/${room.id}`}
                            />
                            <button
                              type="submit"
                              className={styles.followBtn}
                              aria-label="Follow task"
                            >
                              Follow
                            </button>
                          </form>
                        ) : (
                          <form action={unsubscribeTodo}>
                            <input type="hidden" name="todoId" value={t.id} />
                            <input
                              type="hidden"
                              name="from"
                              value={`/room/${room.id}`}
                            />
                            <button
                              type="submit"
                              className={`${styles.followBtn} ${styles.following}`}
                              aria-label="Unfollow task"
                              title="Unfollow"
                            >
                              Following
                            </button>
                          </form>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </main>

        <aside className={styles.colSide}>
          <section className={styles.card}>
            <div className={styles.sectionHead}>
              <h2>Members</h2>
              <span className={styles.counter}>
                {approvedMembers.length + 1}
              </span>
            </div>
            <ul className={styles.memberList} role="list">
              <li className={styles.memberItem}>
                <div className={styles.avatar}>
                  {(room.owner?.name ?? room.owner?.email ?? "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>
                    {room.owner?.name ?? room.owner?.email}
                  </div>
                  <div className={styles.memberRole}>Owner</div>
                </div>
              </li>

              {approvedMembers.map((m) => (
                <li key={m.id} className={styles.memberItem}>
                  <div className={styles.avatar}>
                    {(m.requester.name ?? m.requester.email ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>
                      {m.requester.name ?? m.requester.email}
                    </div>
                    <div className={styles.memberRole}>Member</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {isOwner && (
            <section className={styles.card}>
              <div className={styles.sectionHead}>
                <h2>Join Requests</h2>
                <span className={styles.counter}>{pendingRequests.length}</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className={styles.empty}>No pending requests</div>
              ) : (
                <ul className={styles.requestList} role="list">
                  {pendingRequests.map((jr) => (
                    <li key={jr.id} className={styles.requestItem}>
                      <div className={styles.requester}>
                        <div className={styles.avatar}>
                          {(jr.requester.name ?? jr.requester.email ?? "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className={styles.requesterInfo}>
                          <div className={styles.requesterName}>
                            {jr.requester.name ?? jr.requester.email}
                          </div>
                          <div className={styles.requesterMeta}>
                            Pending request
                          </div>
                        </div>
                      </div>
                      <div className={styles.actionsRow}>
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
        </aside>
      </div>
    </div>
  );
}
