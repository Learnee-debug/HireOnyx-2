const { createClient } = require('@supabase/supabase-js');

// Create admin client ONCE at module level — not on every request
let adminClient = null;
function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return adminClient;
}

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    if (!['seeker', 'recruiter'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format.' });
    }

    // Password minimum length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const { data, error } = await getAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (error) {
      // Friendly error messages
      if (error.message.includes('already registered')) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
      }
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, userId: data.user.id });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ success: false, error: 'Signup failed. Please try again.' });
  }
};
