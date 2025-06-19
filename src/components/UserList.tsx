
import React from 'react';
import { RegisteredUser } from '@/types/playground';
import { CalendarDays, User } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type Props = {
  users: RegisteredUser[];
};

const UserList: React.FC<Props> = ({ users }) => {
  return (
    <div className="bg-white rounded-md p-4 text-black border-4 border-orange-500">
      <h2 className="font-press-start text-sm mb-4 flex items-center text-black">
        <User size={16} className="mr-2 text-jam-purple" />
        Lista Iscritti
      </h2>
      
      {users.length > 0 ? (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="border-b pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-jam-blue">
                    {user.nickname || 'Utente Anonimo'}
                  </span>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <CalendarDays size={12} className="mr-1" />
                    <span className="text-black">
                      {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: it })}
                    </span>
                  </div>
                  {/* NEVER show email address - only nickname for privacy */}
                  <p className="text-xs text-gray-500 mt-1">
                    Privacy protetta - solo nickname visibile
                  </p>
                </div>
                
                {user.isAdmin && (
                  <span className="bg-jam-purple text-white text-xs px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 flex items-center justify-center h-20">
          Nessun utente registrato
        </p>
      )}
      
      <div className="mt-4 pt-2 border-t text-xs text-gray-500">
        <p className="text-black">
          Per privacy, vengono mostrati solo i nickname degli utenti.
          Le informazioni sono gestite secondo la nostra{' '}
          <button 
            className="text-jam-blue underline" 
            onClick={() => window.dispatchEvent(new CustomEvent('open-privacy-policy'))}
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserList;
