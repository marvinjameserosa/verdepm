export interface ProjectPageRouteParams {
  slug: string;
}

export interface ProjectPageProps {
  params: Promise<ProjectPageRouteParams>;
}
