import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QueueUser } from '../types';

interface QueueTableProps {
  users: QueueUser[];
  now: number;
}

export function QueueTable({ users, now }: QueueTableProps) {
  const visibleUsers = users.filter(
    (user) => user.status !== 'IDLE' || user.position !== null,
  );

  const sortedUsers = [...visibleUsers].sort((firstUser, secondUser) => {
    if (firstUser.position === null && secondUser.position === null) {
      return firstUser.name.localeCompare(secondUser.name);
    }

    if (firstUser.position === null) {
      return 1;
    }

    if (secondUser.position === null) {
      return -1;
    }

    return firstUser.position - secondUser.position;
  });

  return (
    <div className="queue-table">
      <div className="queue-table__scroll">
        <table className="queue-table__table">
          <thead className="queue-table__head">
            <tr>
              <th className="queue-table__cell queue-table__cell--center queue-table__cell--small">
                Pos
              </th>
              <th className="queue-table__cell">User</th>
              <th className="queue-table__cell">Status</th>
              <th className="queue-table__cell queue-table__cell--right">Timer</th>
            </tr>
          </thead>
          <tbody className="queue-table__body">
            <AnimatePresence mode="popLayout">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="queue-table__empty">
                    No users in the queue yet.
                  </td>
                </tr>
              ) : null}

              {sortedUsers.map((user) => {
                const remainingSeconds =
                  user.status === 'RESERVED' && user.expiresAt
                    ? Math.max(0, Math.ceil((user.expiresAt - now) / 1000))
                    : null;

                const minutes =
                  remainingSeconds !== null
                    ? Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
                    : '--';

                const seconds =
                  remainingSeconds !== null
                    ? (remainingSeconds % 60).toString().padStart(2, '0')
                    : '--';

                return (
                  <motion.tr
                    key={user.userId}
                    layout
                    initial={{ opacity: 0, backgroundColor: '#ffffff' }}
                    animate={{
                      opacity: 1,
                      backgroundColor:
                        user.status === 'RESERVED' ? '#fef3c7' : '#ffffff',
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="queue-table__row"
                  >
                    <td className="queue-table__value queue-table__value--center">
                      {user.position ?? '-'}
                    </td>
                    <td className="queue-table__value queue-table__value--name">
                      {user.name}
                    </td>
                    <td className="queue-table__value">
                      <span className={getTableStatusClassName(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td className="queue-table__value queue-table__value--right queue-table__value--timer">
                      {remainingSeconds !== null ? `${minutes}:${seconds}` : '--:--'}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getTableStatusClassName(status: QueueUser['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'table-status table-status--completed';
    case 'RESERVED':
      return 'table-status table-status--reserved';
    case 'WAITING':
      return 'table-status table-status--waiting';
    case 'EXPIRED':
      return 'table-status table-status--expired';
    default:
      return 'table-status table-status--idle';
  }
}
