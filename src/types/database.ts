export type JobOffer = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  salary_range: string | null;
  contract_type: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | null;
  created_at: string;
};

export type Application = {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cv_url: string | null;
  applied_at: string;
  job_offers?: JobOffer;
};
