
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  Home 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const { isLoggedIn, nickname, isAdmin, logout } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo",
    });
    navigate("/");
  };

  const playSoundEffect = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(err => console.log('Audio playback error:', err));
  };

  return (
    <header className="bg-black bg-opacity-80 backdrop-blur-md sticky top-0 z-10 border-b-4 border-red-600">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-white hover:text-red-600 transition-colors">
          <div className="flex items-center">
            <MapPin className="text-red-600" />
            <span className="font-press-start text-xs ml-1 hidden sm:inline">
              PLAYGROUND JAM
            </span>
            <span className="font-press-start text-xs ml-1 sm:hidden">
              PJ
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/" 
            className="text-white hover:text-red-600 transition-colors px-2 py-1"
            onClick={playSoundEffect}
          >
            <Home className="h-4 w-4 sm:hidden" />
            <span className="font-press-start text-xs hidden sm:inline">Home</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link 
                to="/add-playground" 
                className="text-white hover:text-red-600 transition-colors px-2 py-1"
                onClick={playSoundEffect}
              >
                <Plus className="h-4 w-4 sm:hidden" />
                <span className="font-press-start text-xs hidden sm:inline">Aggiungi</span>
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-white hover:text-red-600 transition-colors px-2 py-1"
                  onClick={playSoundEffect}
                >
                  <ShieldCheck className="h-4 w-4 sm:hidden" />
                  <span className="font-press-start text-xs hidden sm:inline">Admin</span>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <span className="sr-only">User menu</span>
                    <User className="h-4 w-4 text-red-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black text-white border border-red-600">
                  <DropdownMenuLabel className="font-press-start text-xs">
                    {nickname}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="font-press-start text-xs cursor-pointer flex items-center text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link 
              to="/login" 
              className="text-white hover:text-red-600 transition-colors px-2 py-1"
              onClick={playSoundEffect}
            >
              <User className="h-4 w-4 sm:hidden" />
              <span className="font-press-start text-xs hidden sm:inline">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
