import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  process.exit(1);
}

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Also create a regular client for user operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_ANON_KEY environment variable!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Backend server initialized');
console.log('🔍 Supabase URL:', supabaseUrl.substring(0, 30) + '...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
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
      console.error('❌ Error message:', supabaseError.message);
      console.error('❌ Error stack:', supabaseError.stack);
      return res.status(500).json({
        success: false,
        error: `Supabase error: ${supabaseError.message || 'Unknown error'}`
      });
    }

    if (error) {
      console.error('❌ Login error:', error.message);
      console.error('❌ Error code:', error.status);
      console.error('❌ Error name:', error.name);
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Check if it's a network/connection error
      if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED'))) {
        console.error('❌ This appears to be a network/connection error with Supabase');
        console.error('❌ Check:');
        console.error('   1. Supabase URL is correct:', supabaseUrl);
        console.error('   2. Anon key is set:', !!supabaseAnonKey);
        console.error('   3. Backend can reach Supabase API');
        return res.status(500).json({
          success: false,
          error: 'Cannot connect to Supabase. Please check backend configuration and network connectivity.'
        });
      }
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      
      // Check for email confirmation error specifically
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('email_not_confirmed') ||
          error.status === 400 && error.message.toLowerCase().includes('confirm')) {
        errorMessage = 'Please confirm your email address before logging in. Check your inbox for a confirmation link, or contact support if you need help.';
      } 
      // Check for invalid credentials
      else if (error.message.includes('Invalid login credentials') || 
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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

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
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.toString) {
      errorMessage = error.toString();
    }
    
    // Check for common network/Supabase errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Supabase. Please check your Supabase configuration.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
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

    console.log('📝 Signup attempt for:', email);

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || ''
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`
      }
    });

    if (error) {
      console.error('❌ Signup error:', error.message);
      
      // Handle specific errors - check for various "already exists" messages
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('user already exists') ||
          errorMsg.includes('email already') ||
          errorMsg.includes('already exists') ||
          errorMsg.includes('duplicate') ||
          error.code === '23505') { // PostgreSQL unique constraint violation
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
    console.log('📧 Email confirmation status:', data.user.email_confirmed_at ? 'Already confirmed' : 'Not confirmed');
    
    // Auto-confirm email if not already confirmed (using admin client)
    if (!data.user.email_confirmed_at) {
      try {
        console.log('📧 Auto-confirming email for new user...');
        const { data: updatedUser, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('⚠️ Failed to auto-confirm email:', confirmError.message);
          console.error('⚠️ This might be because email confirmation is disabled in Supabase settings');
          // Continue anyway - user can confirm via email link if needed
        } else {
          console.log('✅ Email auto-confirmed successfully');
          // Update the user data with confirmed status
          if (updatedUser?.user) {
            data.user = updatedUser.user;
          }
        }
      } catch (confirmErr) {
        console.error('⚠️ Exception auto-confirming email:', confirmErr.message);
        // Continue anyway - signup was successful
      }
    }

    // User profile is created automatically by database trigger
    // Return user data
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
    
    // Set the session using the token
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (error) {
      console.error('❌ Logout error:', error.message);
      // Still return success as logout should always work
    }

    // Sign out
    await supabase.auth.signOut();

    console.log('✅ Logout successful');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout exception:', error);
    // Still return success
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

    console.log('🔑 Password reset request for:', email);

    const resetUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/reset-password`
      : 'http://localhost:8080/reset-password';

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

    const token = authHeader.substring(7);
    
    // Set session
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

    // Update password
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

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

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

// Export for Vercel serverless functions
export default app;

// Only start server if running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
}


