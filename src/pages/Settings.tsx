import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    theme: 'dark',
    privacy: 'private',
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-zinc-100 font-sans antialiased selection:bg-accent-pink selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cyber-dark/80 backdrop-blur-xl border-b border-zinc-800/60 px-6 lg:px-16 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 bg-accent-cyan transform -skew-x-12" />
            <div className="absolute inset-0 bg-accent-pink transform skew-x-12 translate-x-1 mix-blend-screen" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase font-mono">HIRE.FLOW</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-xs font-mono tracking-widest text-zinc-400 hover:text-accent-cyan transition-colors">
          // BACK
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 lg:px-16 py-12 pb-20">
        {/* Header */}
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-panel-bg border border-zinc-800 text-[11px] font-mono tracking-widest text-accent-cyan">
            <span className="w-1.5 h-1.5 bg-accent-cyan animate-pulse rounded-full" />
            CONFIG_PANEL_ACTIVE
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter uppercase leading-tight">
            System <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-cyan to-accent-pink">Settings</span>
          </h1>
          <p className="text-zinc-400 text-sm">Customize your experience and manage account preferences</p>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-accent-cyan" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Account Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full bg-cyber-dark border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full bg-cyber-dark border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase block mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-cyber-dark border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:border-accent-cyan transition-colors placeholder:text-zinc-600"
                />
              </div>

              <button className="relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-cyan hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Update Account</span>
                <div className="absolute inset-0 bg-accent-cyan transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
              </button>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-accent-pink" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                { key: 'notifications', label: 'Push Notifications', desc: 'Receive real-time alerts on your device' },
                { key: 'emailUpdates', label: 'Email Updates', desc: 'Daily digest of application activity' },
              ].map((option) => (
                <label key={option.key} className="flex items-center justify-between p-4 bg-cyber-dark/50 border border-zinc-800 cursor-pointer group hover:border-accent-pink transition-colors">
                  <div>
                    <p className="font-mono text-sm uppercase tracking-tight text-zinc-100">{option.label}</p>
                    <p className="text-xs text-zinc-500 mt-1">{option.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[option.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    className="w-5 h-5 accent-accent-pink cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-accent-lime" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Privacy & Security</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase block mb-3">
                  Profile Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['private', 'public'].map((val) => (
                    <label key={val} className="cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value={val}
                        checked={settings.privacy === val}
                        onChange={(e) => setSettings(prev => ({ ...prev, privacy: e.target.value }))}
                        className="sr-only"
                      />
                      <div className={`px-4 py-3 text-xs font-mono text-center uppercase tracking-widest border transition-all ${
                        settings.privacy === val
                          ? 'bg-accent-lime/20 border-accent-lime'
                          : 'bg-cyber-dark/50 border-zinc-800'
                      }`}>
                        {val === 'private' ? '🔒 Private' : '🌐 Public'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button className="relative px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-pink hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Enable Two-Factor Authentication</span>
                <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
              </button>
            </div>
          </section>

          {/* Theme Settings */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-accent-purple" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Appearance</h2>
            </div>

            <div>
              <label className="text-xs font-mono tracking-widest text-zinc-400 uppercase block mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['dark', 'light'].map((val) => (
                  <label key={val} className="cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={val}
                      checked={settings.theme === val}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`px-4 py-3 text-xs font-mono text-center uppercase tracking-widest border transition-all ${
                      settings.theme === val
                        ? 'bg-accent-purple/20 border-accent-purple'
                        : 'bg-cyber-dark/50 border-zinc-800'
                    }`}>
                      {val === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-linear-to-r from-accent-pink/10 to-accent-orange/10 border border-zinc-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-accent-orange animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight uppercase">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-zinc-400">These actions are irreversible. Proceed with caution.</p>
              
              <button
                onClick={handleLogout}
                className="relative w-full px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-white border border-accent-orange hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-accent-orange transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0 opacity-20" />
              </button>

              <button className="relative w-full px-6 py-3 text-xs font-bold uppercase tracking-widest bg-transparent text-accent-pink border border-accent-pink hover:shadow-[0_0_20px_rgba(255,0,85,0.3)] transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Delete Account</span>
                <div className="absolute inset-0 bg-accent-pink transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
              </button>
            </div>
          </section>

          {/* System Info */}
          <section className="bg-panel-bg border border-panel-border p-8">
            <h3 className="text-sm font-mono tracking-widest text-zinc-500 uppercase mb-4">System Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-600 space-y-2">
              <div>App Version: <span className="text-accent-cyan">4.1.2</span></div>
              <div>Last Updated: <span className="text-accent-cyan">2026-05-22</span></div>
              <div>Status: <span className="text-accent-lime">ONLINE</span></div>
              <div>Encryption: <span className="text-accent-pink">AES-256</span></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
