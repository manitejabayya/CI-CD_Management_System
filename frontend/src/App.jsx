import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const emptyAuthForm = {
  username: '',
  email: '',
  password: '',
}

const emptyRepoForm = {
  repoName: '',
  githubUrl: '',
  branchName: 'main',
}

const emptyJenkinsForm = {
  jobName: '',
}

function buildUrl(path) {
  return `${API_BASE}${path}`
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data?.message ?? data?.error ?? 'Request failed'

    throw new Error(message)
  }

  return data
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [repoForm, setRepoForm] = useState(emptyRepoForm)
  const [jenkinsForm, setJenkinsForm] = useState(emptyJenkinsForm)
  const [token, setToken] = useState(() => localStorage.getItem('cicd-token') ?? '')
  const [username, setUsername] = useState(() => localStorage.getItem('cicd-username') ?? '')
  const [repositories, setRepositories] = useState([])
  const [buildSummary, setBuildSummary] = useState(null)
  const [buildLogs, setBuildLogs] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [repoLoading, setRepoLoading] = useState(false)
  const [jenkinsLoading, setJenkinsLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  const authTitle = useMemo(
    () => (authMode === 'login' ? 'Welcome back' : 'Create your account'),
    [authMode],
  )

  useEffect(() => {
    if (!token) {
      setRepositories([])
      return
    }

    void loadRepositories(token)
  }, [token])

  async function loadRepositories(currentToken = token) {
    if (!currentToken) {
      return
    }

    setRepoLoading(true)
    setErrorMessage('')

    try {
      const data = await request('/api/repos', { token: currentToken })
      setRepositories(Array.isArray(data) ? data : [])
    } catch (error) {
      setRepositories([])
      setErrorMessage(error.message)
    } finally {
      setRepoLoading(false)
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : authForm

      const data = await request(path, { method: 'POST', body: payload })
      const nextToken = data.token ?? ''

      setToken(nextToken)
      setUsername(authForm.username || authForm.email)
      localStorage.setItem('cicd-token', nextToken)
      localStorage.setItem('cicd-username', authForm.username || authForm.email)
      setStatusMessage(authMode === 'login' ? 'Signed in successfully.' : 'Account created successfully.')
      setAuthForm(emptyAuthForm)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRepoSubmit(event) {
    event.preventDefault()
    setRepoLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await request('/api/repos', {
        method: 'POST',
        body: repoForm,
        token,
      })

      setRepoForm(emptyRepoForm)
      setStatusMessage('Repository saved.')
      await loadRepositories()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setRepoLoading(false)
    }
  }

  async function handleDeleteRepository(id) {
    if (!window.confirm('Delete this repository?')) {
      return
    }

    setErrorMessage('')
    setStatusMessage('')

    try {
      await request(`/api/repos/${id}`, {
        method: 'DELETE',
        token,
      })

      setStatusMessage('Repository deleted.')
      await loadRepositories()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleTriggerBuild(event) {
    event.preventDefault()
    if (!jenkinsForm.jobName.trim()) {
      setErrorMessage('Enter a Jenkins job name.')
      return
    }

    setJenkinsLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const result = await request(`/api/jenkins/trigger/${encodeURIComponent(jenkinsForm.jobName.trim())}`, {
        method: 'POST',
        token,
      })

      setStatusMessage(result)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setJenkinsLoading(false)
    }
  }

  async function handleFetchStatus() {
    if (!jenkinsForm.jobName.trim()) {
      setErrorMessage('Enter a Jenkins job name.')
      return
    }

    setJenkinsLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const data = await request(`/api/jenkins/status/${encodeURIComponent(jenkinsForm.jobName.trim())}`, {
        token,
      })

      setBuildSummary(data)
      setStatusMessage('Build status loaded.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setJenkinsLoading(false)
    }
  }

  async function handleFetchLogs() {
    if (!jenkinsForm.jobName.trim()) {
      setErrorMessage('Enter a Jenkins job name.')
      return
    }

    setJenkinsLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const data = await request(`/api/jenkins/logs/${encodeURIComponent(jenkinsForm.jobName.trim())}`, {
        token,
      })

      setBuildLogs(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
      setStatusMessage('Build logs loaded.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setJenkinsLoading(false)
    }
  }

  function handleSignOut() {
    setToken('')
    setUsername('')
    setRepositories([])
    setBuildSummary(null)
    setBuildLogs('')
    setStatusMessage('Signed out.')
    setErrorMessage('')
    localStorage.removeItem('cicd-token')
    localStorage.removeItem('cicd-username')
  }

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">CI/CD platform</p>
          <h1>Manage auth, repositories, and Jenkins from one dashboard.</h1>
          <p className="hero-copy">
            A compact frontend for your Spring Boot backend. Sign in, store GitHub repositories,
            and trigger Jenkins jobs without leaving the page.
          </p>
        </div>

        <div className="hero-panel">
          <div className="hero-stat">
            <span>Session</span>
            <strong>{isAuthenticated ? 'Connected' : 'Not signed in'}</strong>
          </div>
          <div className="hero-stat">
            <span>User</span>
            <strong>{username || 'Guest'}</strong>
          </div>
          <div className="hero-stat">
            <span>API</span>
            <strong>{API_BASE || 'Relative /api path'}</strong>
          </div>
        </div>
      </header>

      {(statusMessage || errorMessage) && (
        <section className={`flash ${errorMessage ? 'flash-error' : 'flash-success'}`}>
          <strong>{errorMessage ? 'Error' : 'Success'}</strong>
          <p>{errorMessage || statusMessage}</p>
        </section>
      )}

      {!isAuthenticated ? (
        <section className="auth-grid">
          <article className="card auth-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Authentication</p>
                <h2>{authTitle}</h2>
              </div>
              <div className="segmented-control" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>
            </div>

            <form className="form-stack" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  <span>Username</span>
                  <input
                    value={authForm.username}
                    onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
                    placeholder="maniteja"
                    autoComplete="username"
                  />
                </label>
              )}
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  placeholder="••••••••"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </article>

          <aside className="card info-card">
            <p className="eyebrow">Backend endpoints</p>
            <ul className="endpoint-list">
              <li>
                <strong>POST</strong>
                <span>/api/auth/register</span>
              </li>
              <li>
                <strong>POST</strong>
                <span>/api/auth/login</span>
              </li>
              <li>
                <strong>GET/POST/DELETE</strong>
                <span>/api/repos</span>
              </li>
              <li>
                <strong>POST/GET</strong>
                <span>/api/jenkins/trigger, status, logs</span>
              </li>
            </ul>
          </aside>
        </section>
      ) : (
        <section className="dashboard-grid">
          <article className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Repositories</p>
                <h2>Track GitHub repositories</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => loadRepositories()}>
                Refresh
              </button>
            </div>

            <form className="form-stack compact" onSubmit={handleRepoSubmit}>
              <div className="two-column">
                <label>
                  <span>Repository name</span>
                  <input
                    value={repoForm.repoName}
                    onChange={(event) => setRepoForm({ ...repoForm, repoName: event.target.value })}
                    placeholder="ci-cd-demo"
                    required
                  />
                </label>
                <label>
                  <span>Branch</span>
                  <input
                    value={repoForm.branchName}
                    onChange={(event) => setRepoForm({ ...repoForm, branchName: event.target.value })}
                    placeholder="main"
                    required
                  />
                </label>
              </div>
              <label>
                <span>GitHub URL</span>
                <input
                  value={repoForm.githubUrl}
                  onChange={(event) => setRepoForm({ ...repoForm, githubUrl: event.target.value })}
                  placeholder="https://github.com/you/repo"
                  required
                />
              </label>
              <button className="primary-button" type="submit" disabled={repoLoading}>
                {repoLoading ? 'Saving...' : 'Save repository'}
              </button>
            </form>

            <div className="repository-list">
              {repositories.length === 0 ? (
                <p className="empty-state">No repositories stored yet.</p>
              ) : (
                repositories.map((repository) => (
                  <article key={repository.id} className="repository-item">
                    <div>
                      <strong>{repository.repoName}</strong>
                      <p>{repository.githubUrl}</p>
                      <span>Branch: {repository.branchName}</span>
                    </div>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDeleteRepository(repository.id)}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </article>

          <article className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Jenkins</p>
                <h2>Trigger builds and inspect output</h2>
              </div>
              <button className="ghost-button" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>

            <form className="form-stack compact" onSubmit={handleTriggerBuild}>
              <label>
                <span>Job name</span>
                <input
                  value={jenkinsForm.jobName}
                  onChange={(event) => setJenkinsForm({ ...jenkinsForm, jobName: event.target.value })}
                  placeholder="my-pipeline"
                  required
                />
              </label>

              <div className="button-row">
                <button className="primary-button" type="submit" disabled={jenkinsLoading}>
                  {jenkinsLoading ? 'Working...' : 'Trigger build'}
                </button>
                <button className="ghost-button" type="button" onClick={handleFetchStatus} disabled={jenkinsLoading}>
                  Status
                </button>
                <button className="ghost-button" type="button" onClick={handleFetchLogs} disabled={jenkinsLoading}>
                  Logs
                </button>
              </div>
            </form>

            <div className="result-grid">
              <section className="result-panel">
                <h3>Latest build</h3>
                {buildSummary ? (
                  <dl>
                    <div>
                      <dt>Build number</dt>
                      <dd>{buildSummary.buildNumber}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{buildSummary.status}</dd>
                    </div>
                    <div>
                      <dt>URL</dt>
                      <dd>
                        <a href={buildSummary.url} target="_blank" rel="noreferrer">
                          Open build
                        </a>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="empty-state">No build status loaded yet.</p>
                )}
              </section>

              <section className="result-panel logs-panel">
                <h3>Console logs</h3>
                {buildLogs ? <pre>{buildLogs}</pre> : <p className="empty-state">No logs loaded yet.</p>}
              </section>
            </div>
          </article>
        </section>
      )}
    </div>
  )
}

export default App
