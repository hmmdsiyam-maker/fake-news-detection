export interface PredictionResult {
  prediction: "Fake News" | "Real News" | "REAL" | "FAKE" | string;
  label: number; // 0 = Real, 1 = Fake
  confidence: number;
  latency_ms?: number;
  saved_to_history?: boolean;
  guest_remaining?: number | null;
  daily_remaining?: number | null;
  subscription_tier?: string;
  top_keywords?: string[];
  status: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription_tier?: string;
  today_count?: number;
  today_prediction_count?: number;
  daily_limit?: number | string;
  today_remaining?: number;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  subscription_status?: string | null;
}

export interface HistoryItem {
  id: number;
  headline: string;
  content_preview: string;
  prediction: string;
  label: number;
  confidence: number;
  latency_ms: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_predictions: number;
  real_predictions: number;
  fake_predictions: number;
  avg_confidence: number;
  avg_latency: number;
  active_today: number;
  pro_users?: number;
  enterprise_users?: number;
  estimated_mrr?: number;
  total_revenue?: number;
  total_payments?: number;
}

export interface AdminPaymentItem {
  id: number;
  user_id: number | null;
  username?: string | null;
  email?: string | null;
  plan_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_session_id?: string | null;
  created_at: string;
}

export interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  subscription_tier?: string;
  created_at: string;
  last_login: string | null;
  prediction_count: number;
}

export interface AdminGlobalLog {
  id: number;
  headline: string;
  content_preview?: string;
  prediction: string;
  confidence: number;
  latency_ms?: number;
  created_at: string;
  user_id: number | null;
  username: string | null;
  email: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_display: string;
  amount_cents: number;
  currency: string;
  interval: string;
  daily_limit_display: string;
  features: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  date: string;
  read_time: string;
  tags: string;
  featured: boolean;
  content: string;
  created_at?: string;
  updated_at?: string;
}

