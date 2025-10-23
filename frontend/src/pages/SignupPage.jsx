import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, UserPlus, AlertCircle } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password || !formData.nom || !formData.prenom) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    // ✅ FIX : Passer UN SEUL OBJET avec toutes les données
    const result = await signup({
      email: formData.email,
      password: formData.password,
      nom: formData.nom,
      prenom: formData.prenom,
    });

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Créer un compte
          </h2>
          <p className="text-gray-400">
            Commencez à gérer votre patrimoine immobilier
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Prénom *
                </label>
                <input
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Jean"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Adresse email *
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="votre@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Mot de passe *
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Création du compte...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-400 hover:text-blue-300 transition"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            © 2025 SCI Manager. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
