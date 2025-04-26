import { supabase } from '../lib/supabase';

function Home() {
  const handleLinkedInLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid profile email'
      }
    });
  };

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">LinkedIn Auth Demo</h1>
      <p className="mb-6 text-gray-600 text-center">
        Click the button below to authenticate with your LinkedIn account
      </p>
      <button 
        onClick={handleLinkedInLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
      >
        Connect with LinkedIn
      </button>
    </div>
  );
}

export default Home;