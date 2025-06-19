
import { format } from "date-fns";
import { it } from "date-fns/locale";

const DateDisplay = () => {
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: it });
  
  return (
    <div className="text-center md:text-left arcade-date text-xs md:text-sm">
      {currentDate.toUpperCase()}
    </div>
  );
};

export default DateDisplay;
