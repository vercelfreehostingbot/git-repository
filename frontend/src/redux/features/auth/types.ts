import type { User } from "../api/authApi/types";

export interface InitialState {
  accessToken: string | null;
  user: User | null;
}