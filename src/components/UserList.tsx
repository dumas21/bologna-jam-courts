
import React from 'react';
import { RegisteredUser } from '@/types/playground';

type Props = {
  users: RegisteredUser[];
};

const UserList: React.FC<Props> = ({ users }) => {
  return (
    <div className="bg-white rounded-md p-4 text-black">
      <h2 className="font-press-start text-sm mb-4">Lista Iscritti</h2>
      {users.length > 0 ? (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="border-b pb-2">
              <strong>Nickname:</strong> {user.nickname}
              {!user.checkedIn && (
                <>
                  <br />
                  <strong>Email:</strong> {user.email}
                </>
              )}
              <br />
              <em className="text-xs text-gray-600">
                Registrato il: {new Date(user.createdAt).toLocaleDateString()}
              </em>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Nessun utente registrato</p>
      )}
    </div>
  );
};

export default UserList;
