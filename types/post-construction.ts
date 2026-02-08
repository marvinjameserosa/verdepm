export type PostConstructionTarget = {
  id: string;
  project_id: string;
  scope_one: number | null;
  scope_two: number | null;
  scope_three: number | null;
  trir: number | null;
};

export type DailyLogEntry = {
  id: string;
  project_id: string;
  timestamp: string;
  number_of_incidents: number | null;
  total_employee_hours: number | null;
  equipment_emissions: number | null;
  // Other fields from schema if needed
};

export type MonthlyLogEntry = {
  id: string;
  project_id: string;
  timestamp: string;
  scope_two: number | null;
  scope_three: number | null;
  electricity_consumption: number | null;
  water_consumption: number | null;
  total_waste_mass: number | null;
  // Other fields from schema if needed
};

export type AggregatedPostConstructionData = {
  targets: PostConstructionTarget | null;
  actuals: {
    scope_one: number;
    scope_two: number;
    scope_three: number;
    trir: number;
    total_incidents: number;
    total_hours: number;
  };
  trends: {
    date: string;
    scope_one: number;
    scope_two: number;
    scope_three: number;
    target_scope_one?: number;
    target_scope_two?: number;
    target_scope_three?: number;
  }[];
};
