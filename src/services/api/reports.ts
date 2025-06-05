// This file is deprecated - all functionality moved to Supabase
// Keeping for backward compatibility, but redirecting to Supabase services

import { generateHedonicReport as supabaseHedonicReport, generateJARReport as supabaseJARReport, getRawData as supabaseRawData } from '../supabase/reports';

export const generateHedonicReport = supabaseHedonicReport;
export const generateJARReport = supabaseJARReport;
export const getRawData = supabaseRawData;
