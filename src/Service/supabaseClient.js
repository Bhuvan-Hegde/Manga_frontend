import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://dtwapioeodqbfextlxed.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2FwaW9lb2RxYmZleHRseGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzA4MTgsImV4cCI6MjA2NzIwNjgxOH0.WeKfp9D1d4zsnJKYjb41MLn9ULdYTrERozpvDbToZc8";

export const supabase = createClient(supabaseUrl, supabaseKey);
