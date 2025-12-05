/**
 * Test Supabase Connection
 * Utility to diagnose Supabase connectivity issues
 */

import { getSupabaseClient } from "@/lib/supabase";

export const testSupabaseConnection = async () => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error("❌ Supabase client is null");
    return {
      success: false,
      error: "Supabase client not initialized. Check environment variables.",
    };
  }

  const results: any = {
    clientInitialized: true,
    url: supabase.supabaseUrl,
    tests: [],
  };

  // Test 1: Check if we can reach Supabase
  try {
    console.log("🔍 Test 1: Checking Supabase URL accessibility...");
    const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabase.supabaseKey,
      },
    });
    results.tests.push({
      name: "URL Accessibility",
      success: response.ok || response.status === 404, // 404 is OK, means server is reachable
      status: response.status,
      message: response.ok
        ? "URL is accessible"
        : response.status === 404
        ? "URL is accessible (404 expected)"
        : `HTTP ${response.status}`,
    });
  } catch (error: any) {
    results.tests.push({
      name: "URL Accessibility",
      success: false,
      error: error.message,
      message: "Cannot reach Supabase URL. Check network connection.",
    });
  }

  // Test 2: Check auth endpoint
  try {
    console.log("🔍 Test 2: Checking Auth endpoint...");
    const response = await fetch(`${supabase.supabaseUrl}/auth/v1/health`, {
      method: "GET",
    });
    results.tests.push({
      name: "Auth Endpoint",
      success: response.ok,
      status: response.status,
      message: response.ok ? "Auth endpoint is accessible" : `HTTP ${response.status}`,
    });
  } catch (error: any) {
    results.tests.push({
      name: "Auth Endpoint",
      success: false,
      error: error.message,
      message: "Cannot reach Auth endpoint.",
    });
  }

  // Test 3: Try to get session (should work even if not logged in)
  try {
    console.log("🔍 Test 3: Testing getSession...");
    const { data, error } = await supabase.auth.getSession();
    results.tests.push({
      name: "Get Session",
      success: !error,
      message: error ? error.message : "getSession works",
    });
  } catch (error: any) {
    results.tests.push({
      name: "Get Session",
      success: false,
      error: error.message,
      message: "getSession failed",
    });
  }

  const allPassed = results.tests.every((test: any) => test.success);
  results.success = allPassed;

  console.log("📊 Connection Test Results:", results);
  return results;
};

