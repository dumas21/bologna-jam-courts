
import { useState } from "react";
import { Bell, User, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, username, logout, subscribedPlaygrounds } = useUser();
  const navigate = useNavigate();
  
  return (
    <header className="bg-jam-purple border-b-4 border-white sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex flex-col">
            <h1 className="font-press-start text-sm md:text-lg text-white">
              PLAYGROUND
            </h1>
            <span className="font-press-start text-lg md:text-xl text-jam-orange mt-1">
              JAM BOLOGNA
            </span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link to="/" className="text-white relative">
                <Bell size={24} />
                {subscribedPlaygrounds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-jam-orange text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {subscribedPlaygrounds.length}
                  </span>
                )}
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-white p-1 rounded-full">
                  <User size={24} className="text-jam-dark" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-press-start text-xs">
                    {username}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer font-press-start text-xs text-red-500"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => navigate("/login")} 
              variant="ghost" 
              className="text-white hover:text-jam-orange"
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span className="font-press-start text-xs">LOGIN</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
