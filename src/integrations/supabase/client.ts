// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pceknypetgjazdviwrup.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWtueXBldGdqYXpkdml3cnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODQ4OTcsImV4cCI6MjA0OTY2MDg5N30.dN_zaIz-pGqF1eH6FQzWoJXr8yw2ETW473DpkybEC_o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);