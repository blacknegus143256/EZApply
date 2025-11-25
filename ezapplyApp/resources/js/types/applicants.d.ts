export type Application = {
  id: number;
  status: string;
  desired_location?: string | null;
  preferred_date?: string | null; 
  is_cancelled: boolean;
  cancelled_at?: string | null;
  user?: {
    id: number;
    email: string;
    basicinfo?:{
      id: number;
      first_name: string | null;
      last_name: string | null;
    };
  };
  company?: {
    id: number;
    company_name: string;
  };
};
