import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [pendingToken, setPendingToken] = useState(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await login(username.trim(), password.trim());

      if (response.requires2FA) {
        setShow2FA(true);
        setPendingToken(response.pendingToken);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!totpCode.trim()) {
      setError('Please enter the 2FA code');
      return;
    }

    setLoading(true);

    try {
      const { verify2FA } = useAuth();
      await verify2FA(totpCode.trim(), useBackupCode);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = authLoading || loading;

  return (
    <main className="w-full pt-20 bg-surface min-h-[calc(100vh-20rem)]">
      <div className="max-w-[1360px] mx-auto px-margin-md lg:px-margin-lg py-space-xl flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-space-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed mb-space-lg mx-auto">
              <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-space-sm">Admin Login</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Sign in to access the dashboard</p>
          </div>

          {!show2FA ? (
            <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm space-y-space-lg">
              {error && (
                <div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-center gap-2 font-body-md text-body-md" role="alert">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </div>
              )}

              <Input
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={error && !username ? 'Username is required' : undefined}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={isLoading}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error && !password ? 'Password is required' : undefined}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />

              <Button type="submit" variant="primary" fullWidth size="lg" loading={isLoading}>
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm space-y-space-lg">
              {error && (
                <div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-center gap-2 font-body-md text-body-md" role="alert">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  {error}
                </div>
              )}

              <div className="text-center mb-space-md">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed mb-space-md">
                  <span className="material-symbols-outlined text-[24px]">shield</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">Two-Factor Authentication</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Input
                label={useBackupCode ? 'Backup Code' : 'Authenticator Code'}
                name="totpCode"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                error={error && !totpCode ? 'Code is required' : undefined}
                placeholder={useBackupCode ? 'e.g., abcdef12' : 'e.g., 123456'}
                required
                autoComplete="one-time-code"
                disabled={isLoading}
                maxLength={useBackupCode ? 8 : 6}
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBackupCode}
                  onChange={(e) => setUseBackupCode(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary"
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">Use backup code instead</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-space-sm pt-space-md">
                <Button type="submit" variant="primary" fullWidth className="sm:w-auto" size="lg" loading={isLoading}>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button type="button" variant="outline" fullWidth className="sm:w-auto" size="lg" onClick={() => { setShow2FA(false); setPendingToken(null); }}>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </Button>
              </div>
            </form>
          )}

          <div className="mt-space-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] inline-block mr-1 align-middle">lock</span>
              Secure access • 2FA protected
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}