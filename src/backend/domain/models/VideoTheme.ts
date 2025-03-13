import { Theme } from "@/backend/domain/models/Theme";

export interface VideoTheme {
  id: string;
  videoId: string;
  themeId: string;
  createdAt: Date;
  updatedAt: Date;
  theme?: Theme;
}
