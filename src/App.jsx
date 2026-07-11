import { useEffect, useState } from 'react';

const emptyForm = {
    id: null,
    name: '',
    age: '',
    email: '',
    course: '',
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
        loadStudents();
    }, []);

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
            age: form.age,
            email: form.email,
            course: form.course,
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
                localStorage.setItem('token', data.token);
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
        localStorage.removeItem('token');
    };

    return (
        <div className="app-shell">
            <header className="hero">
                <div>
                    <p className="eyebrow">Student Management</p>
                    <h1>Modern student records</h1>
                    <p>Manage students through a React frontend backed by a MySQL API.</p>
                </div>
                <div>
                    {token ? (
                        <div>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div className="auth-inline">
                            <form onSubmit={handleAuthSubmit} className="auth-form">
                                <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" required />
                                <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" type="password" required />
                                <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
                            </form>
                            <div className="auth-toggle">
                                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                                    Switch to {authMode === 'login' ? 'Register' : 'Login'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="content-grid">
                <section className="card">
                    <h2>{form.id ? 'Edit student' : 'Add student'}</h2>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required />
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                        <input name="course" value={form.course} onChange={handleChange} placeholder="Course" required />
                        <div className="actions">
                            <button type="submit">{form.id ? 'Save changes' : 'Add student'}</button>
                            <button type="button" className="secondary" onClick={resetForm}>Clear</button>
                        </div>
                    </form>
                    {message ? <p className="status">{message}</p> : null}
                    {authMessage ? <p className="status">{authMessage}</p> : null}
                </section>

                <section className="card">
                    <div className="table-header">
                        <h2>Students</h2>
                        <span>{students.length} records</span>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.age}</td>
                                        <td>{student.email}</td>
                                        <td>{student.course}</td>
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
            </main>
        </div>
    );
}

export default App;
