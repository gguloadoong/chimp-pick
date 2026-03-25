export class CheckinResponseDto {
  streak: number;
  maxStreak: number;
  reward: number;
  isAlreadyCheckedIn: boolean;
}

export type MissionType = 'FIRST_PREDICT' | 'THREE_PREDICTS' | 'SHARE';

export class CompleteMissionResponseDto {
  completed: boolean;
  reward: number;
  alreadyCompleted: boolean;
}
