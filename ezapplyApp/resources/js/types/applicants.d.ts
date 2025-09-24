export type Application = {
  id: number;
  status: string;
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
};
