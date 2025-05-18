
export interface Comment {
  id: string;
  text: string;
  user: string;
  timestamp: number;
}

export interface CheckInRecord {
  playgroundId: string;
  email: string;
  nickname: string;
  timestamp: number;
}

export interface RegisteredUser {
  email: string;
  password: string;
  nickname: string;
  isAdmin: boolean;
  registrationDate: number;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  icon: string;
}
