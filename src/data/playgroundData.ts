
import { Playground } from "@/types/playground";
import { centroPlaygrounds } from "./districts/centro";
import { navilePlaygrounds } from "./districts/navile";
import { bologninaPlaygrounds } from "./districts/bolognina";
import { savenaPlaygrounds } from "./districts/savena";
import { sanDonatoPlaygrounds } from "./districts/san-donato";
import { murriPlaygrounds } from "./districts/murri";

export const playgroundData: Playground[] = [
  ...centroPlaygrounds,
  ...navilePlaygrounds,
  ...bologninaPlaygrounds,
  ...savenaPlaygrounds,
  ...sanDonatoPlaygrounds,
  ...murriPlaygrounds
];
