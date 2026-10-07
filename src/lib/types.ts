export type EmergencyPayload = {
  allergies: string[];
  chronicConditions: string[];
  routineMeds: string[];
  bloodType: string;
  emergencyContacts: { name: string; phone: string }[];
  notes?: string;
};

export type LockedCardPayload = {
  photoUrl: string;
  nickname: string;
  age: number;
  bloodType: string;
};

export type BreakGlassReason = 'IGD' | 'AMBULANS' | 'EVENT' | 'LAINNYA';
