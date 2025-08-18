"use client";

import Link from "next/link";
import styles from "@/app/component/Room/RoomLListItem.module.scss";
import { joinRoom } from "@/actions/rooms";

type Member = { id: string; label: string };

type Props = {
  id: string;
  name: string;
  ownerLabel: string;
  members: Member[];
  disableJoin: boolean;
  isOwner: boolean;
  isMember: boolean;
};

export default function RoomListItem({
  id,
  name,
  ownerLabel,
  members,
  disableJoin,
  isOwner,
  isMember,
}: Props) {
  return (
    <div className={styles.card}>
      <Link href={`/room/${id}`} className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <span className={styles.owner}>Owner: {ownerLabel}</span>
      </Link>

      <div className={styles.members}>
        <span className={styles.sectionLabel}>Members</span>
        {members.length === 0 ? (
          <span className={styles.empty}>No members yet</span>
        ) : (
          <div className={styles.avatars}>
            {members.slice(0, 5).map((m) => (
              <div key={m.id} className={styles.avatar} title={m.label}>
                {m.label.charAt(0).toUpperCase()}
              </div>
            ))}
            {members.length > 5 && (
              <div className={styles.more}>+{members.length - 5}</div>
            )}
          </div>
        )}
      </div>

      {!isOwner && !isMember && (
        <form action={joinRoom} className={styles.joinForm}>
          <input type="hidden" name="roomId" value={id} />
          <button
            type="submit"
            className={styles.joinButton}
            disabled={disableJoin}
          >
            {disableJoin ? "Request Sent" : "Join to Room"}
          </button>
        </form>
      )}
    </div>
  );
}
