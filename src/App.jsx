import React, { useEffect, useState } from 'react';

const emptyForm = {
    id: null,
    name: '',
    semester: '',
    email: '',
    course: '',
    city: '',
};

function App() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Auth state
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            setMessage('Unable to load students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadStudents();
        }
    }, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const resetForm = () => {
        setForm(emptyForm);
    };

    const authHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            name: form.name,
            semester: form.semester,
            email: form.email,
            course: form.course,
            city: form.city,
        };

        try {
            const response = form.id
                ? await fetch(`/api/students/${form.id}`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                })
                : await fetch('/api/students', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(payload),
                });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Request failed');
            }

            setMessage(form.id ? 'Student updated.' : 'Student added.');
            resetForm();
            loadStudents();
        } catch (error) {
            setMessage(error.message || 'Unable to save student.');
        }
    };

    const handleEdit = (student) => {
        setForm(student);
    };

    const handleDelete = async (studentId) => {
        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Delete failed');
            }
            setMessage('Student deleted.');
            loadStudents();
        } catch (error) {
            setMessage(error.message || 'Unable to delete student.');
        }
    };

    // --- Auth handlers ---
    const handleAuthSubmit = async (evt) => {
        evt.preventDefault();
        setAuthMessage('');
        try {
            const res = await fetch(`/api/auth/${authMode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: authEmail, password: authPassword }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Auth failed');
            }
            if (authMode === 'login') {
                setToken(data.token);
                const nextUserName = data.user?.email || authEmail;
                setUserName(nextUserName);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', nextUserName);
                setAuthMessage('Logged in');
            } else {
                setAuthMessage('Registered; you can now log in');
                setAuthMode('login');
            }
        } catch (err) {
            setAuthMessage(err.message || 'Auth error');
        }
    };

    const handleLogout = () => {
        setToken('');
        setUserName('');
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
    };

    return (
        <div className="app-shell">
            <main className="welcome-shell">
                <section className="welcome-card">
                    <div className="welcome-copy">
                        <p className="eyebrow">Student Management</p>
                        <h1>{token ? `Welcome, ${userName}` : 'Welcome'}</h1>
                        <p>{token ? 'You are signed in and ready to manage student records.' : 'Please sign in or create an account to manage student records.'}</p>
                    </div>

                    {!token ? (
                        <div className="auth-panel">
                            <div className="card-heading">
                                <h3>{authMode === 'login' ? 'Sign in' : 'Create account'}</h3>
                                <p>{authMode === 'login' ? 'Access your student workspace.' : 'Register to get started.'}</p>
                            </div>
                            <form onSubmit={handleAuthSubmit} className="form-grid">
                                <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" required />
                                <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" type="password" required />
                                <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
                            </form>
                            <button type="button" className="link-btn alt" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                                {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
                            </button>
                            {authMessage ? <p className="status">{authMessage}</p> : null}
                        </div>
                    ) : (
                        <div className="workspace-card">
                            <div className="topbar">
                                <div>
                                    <h2>Student workspace</h2>
                                    <p>Manage student records from here.</p>
                                </div>
                                <button onClick={handleLogout} className="secondary">Logout</button>
                            </div>

                            <section className="card">
                                <div className="card-heading">
                                    <h3>{form.id ? 'Edit student' : 'Add student'}</h3>
                                    <p>Capture the latest details in seconds.</p>
                                </div>
                                <form onSubmit={handleSubmit} className="form-grid">
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                                    <input name="semester" value={form.semester} onChange={handleChange} placeholder="Semester" required />
                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                                    <input name="course" value={form.course} onChange={handleChange} placeholder="Course" required />
                                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                                    <div className="actions">
                                        <button type="submit">{form.id ? 'Save changes' : 'Add student'}</button>
                                        <button type="button" className="secondary" onClick={resetForm}>Clear</button>
                                    </div>
                                </form>
                                {message ? <p className="status">{message}</p> : null}
                            </section>

                            <section className="card">
                                <div className="table-header">
                                    <h3>Student records</h3>
                                    <span>{students.length} records</span>
                                </div>
                                {loading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Semester</th>
                                                <th>Email</th>
                                                <th>Course</th>
                                                <th>City</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => (
                                                <tr key={student.id}>
                                                    <td>{student.name}</td>
                                                    <td>{student.semester}</td>
                                                    <td>{student.email}</td>
                                                    <td>{student.course}</td>
                                                    <td>{student.city}</td>
                                                    <td>
                                                        <button className="link-btn" onClick={() => handleEdit(student)}>Edit</button>
                                                        <button className="link-btn danger" onClick={() => handleDelete(student.id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </section>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
