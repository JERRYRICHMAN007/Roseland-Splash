/**
 * Vercel Serverless Function Entry Point
 * This file wraps the Express app for Vercel's serverless environment
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// Initialize Supabase Admin Client (uses service role key for backend operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Also create a regular client for user operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

console.log('✅ Backend server initialized');
if (supabaseUrl) {
  console.log('🔍 Supabase URL:', supabaseUrl.substring(0, 30) + '...');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Import routes from server/index.js
// We'll need to copy the route handlers here or import them
// For now, let's import the app from server/index.js but handle it properly
import('../server/index.js').then((serverModule) => {
  // The server module exports the app as default
  // We'll use the routes from it
}).catch((err) => {
  console.error('Failed to load server module:', err);
});

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * POST /api/auth/login
 * Login user with email and password
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: Supabase client not initialized'
      });
    }

    console.log('🔐 Login attempt for:', email);

    // Use regular client for user authentication
    let data, error;
    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });
      data = result.data;
      error = result.error;
    } catch (supabaseError) {
      console.error('❌ Supabase client exception:', supabaseError);
      return res.status(500).json({
        success: false,
        error: `Supabase error: ${supabaseError.message || 'Unknown error'}`
      });
    }

    if (error) {
      console.error('❌ Login error:', error.message);
      
      let errorMessage = error.message;
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('email_not_confirmed')) {
        errorMessage = 'Please confirm your email address before logging in.';
      } else if (error.message.includes('Invalid login credentials') || 
                 error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      return res.status(401).json({
        success: false,
        error: errorMessage
      });
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful for:', email);

    // Get user profile
    let profile = null;
    if (supabaseAdmin) {
      const { data: profileData } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = profileData;
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      firstName: profile?.first_name || data.user.user_metadata?.first_name || '',
      lastName: profile?.last_name || data.user.user_metadata?.last_name || '',
      phone: profile?.phone || data.user.user_metadata?.phone || '',
      createdAt: data.user.created_at
    };

    res.json({
      success: true,
      user: userData,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token
      }
    });
  } catch (error) {
    console.error('❌ Login exception:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and password are required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: Supabase client not initialized'
      });
    }

    console.log('📝 Signup attempt for:', email);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || ''
        },
        emailRedirectTo: `${frontendUrl}/login`
      }
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('user already exists') ||
          errorMsg.includes('email already') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('duplicate')) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please log in instead or use a different email address.'
        });
      }

      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create user account'
      });
    }

    console.log('✅ Signup successful for:', email);
    
    // Auto-confirm email if not already confirmed (using admin client)
    if (!data.user.email_confirmed_at && supabaseAdmin) {
      try {
        console.log('📧 Auto-confirming email for new user...');
        await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        console.log('✅ Email auto-confirmed successfully');
      } catch (confirmErr) {
        console.error('⚠️ Exception auto-confirming email:', confirmErr.message);
      }
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.user_metadata?.first_name || firstName,
      lastName: data.user.user_metadata?.last_name || lastName,
      phone: data.user.user_metadata?.phone || phone || '',
      createdAt: data.user.created_at
    };

    res.json({
      success: true,
      user: userData,
      message: 'Account created successfully. You can now log in.'
    });
  } catch (error) {
    console.error('❌ Signup exception:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7);
    
    if (supabase) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });
      await supabase.auth.signOut();
    }

    console.log('✅ Logout successful');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout exception:', error);
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Request password reset
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: Supabase client not initialized'
      });
    }

    console.log('🔑 Password reset request for:', email);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: resetUrl
      }
    );

    if (error) {
      console.error('❌ Password reset error:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Password reset email sent to:', email);
    res.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('❌ Password reset exception:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/update-password
 * Update password after reset
 */
app.post('/api/auth/update-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: Supabase client not initialized'
      });
    }

    const token = authHeader.substring(7);
    
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (sessionError || !sessionData.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('❌ Password update error:', error.message);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Password updated successfully');
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('❌ Password update exception:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/user
 * Get current user from token
 */
app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: Supabase client not initialized'
      });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    let profile = null;
    if (supabaseAdmin) {
      const { data: profileData } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = profileData;
    }

    const userData = {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.first_name || '',
      lastName: profile?.last_name || user.user_metadata?.last_name || '',
      phone: profile?.phone || user.user_metadata?.phone || '',
      createdAt: user.created_at
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('❌ Get user exception:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Export the Express app for Vercel
export default app;
