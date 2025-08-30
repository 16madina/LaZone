-- Fix function search path security issues
ALTER FUNCTION public.can_create_listing(uuid) SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';

-- Add additional security policies for profiles table
CREATE POLICY "Profiles are only viewable by verified agents for contact purposes" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != user_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.user_id = auth.uid() 
    AND p2.agent_verified = true
  )
  AND user_type IN ('agence', 'démarcheur')
);

-- Add analytics tables for advanced reporting
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can create their own analytics events"
ON public.analytics_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events FOR SELECT 
USING (auth.uid() = user_id);

-- Performance tracking table
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL DEFAULT 'ms',
  page_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Performance metrics policies
CREATE POLICY "Users can create performance metrics"
ON public.performance_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view aggregated performance data"
ON public.performance_metrics FOR SELECT 
USING (true); -- Allow viewing for analytics purposes

-- Security audit log
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Security audit policies
CREATE POLICY "System can create audit logs"
ON public.security_audit_log FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_action_type ON public.security_audit_log(action_type);