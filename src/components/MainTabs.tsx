import { Playground } from "@/types/playground";
import PlaygroundList from "@/components/PlaygroundList";

interface MainTabsProps {
  playgrounds: Playground[];
  selectedPlayground: Playground | null;
  onSelectPlayground: (playground: Playground) => void;
  onCheckIn: (playgroundId: string, userNickname: string) => boolean;
  onCheckOut: (playgroundId: string, userNickname: string) => boolean;
  hasUserCheckedIn: (playgroundId: string, userNickname: string) => boolean;
  checkInRecords: { [playgroundId: string]: string[] };
  onRatingUpdate: (playgroundId: string, newRating: number, newRatingCount: number) => void;
  playSoundEffect: (action: string) => void;
  scrollToTop: () => void;
}

const MainTabs = ({
  playgrounds,
  selectedPlayground,
  onSelectPlayground,
  onCheckIn,
  onCheckOut,
  hasUserCheckedIn,
  checkInRecords,
  onRatingUpdate,
}: MainTabsProps) => {
  return (
    <PlaygroundList
      playgrounds={playgrounds}
      selectedPlayground={selectedPlayground}
      onSelectPlayground={onSelectPlayground}
      onCheckIn={onCheckIn}
      onCheckOut={onCheckOut}
      hasUserCheckedIn={hasUserCheckedIn}
      checkInRecords={checkInRecords}
      onRatingUpdate={onRatingUpdate}
    />
  );
};

export default MainTabs;
