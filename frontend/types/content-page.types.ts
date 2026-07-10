export type PageSlug = "HELP" | "PRIVACY" | "TERMS" | "SUPPORT" | "TEAMS";

export interface ContentPage {
  id: string;
  slug: PageSlug;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateContentPagePayload {
  title: string;
  body: string;
}
