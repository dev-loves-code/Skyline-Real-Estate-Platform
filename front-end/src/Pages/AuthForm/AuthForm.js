import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const AuthForm = () => {
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signInData, setSignInData] = useState({ name: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  const handleSignInChange = (e) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(signInData),
      });
  
      const data = await response.json();
      console.log('Sign-in response:', data); 
  
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'admin') {
          console.log('Navigating to admin dashboard'); 
          navigate('/admin');
        } else {
          console.log('Navigating to user dashboard');
          navigate('/');
        }
      } else {
        console.log('Error message:', data.message); 
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('Error connecting to the server');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please sign in.');
        setIsSignUpMode(false);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      setError('Error connecting to the server');
    }
  };

  return (
    <main className={isSignUpMode ? 'sign-up-mode' : ''}>
      <div className="box">
        <div className="inner-box">
          <div className="forms-wrap">
           
            <form onSubmit={handleSignInSubmit} className="sign-in-form">
              <div className="heading">
                <h2>Welcome Back</h2>
                <h6>Not registered yet?</h6>
                <a href="#" className="toggle" onClick={toggleMode}>Sign up</a>
              </div>
              <div className="actual-form">
                <div className="input-wrap">
                  <input
                    type="text"
                    name="name"
                    minLength="4"
                    className="input-field"
                    autoComplete="off"
                    required
                    value={signInData.name}
                    onChange={handleSignInChange}
                  />
                  <label>Name</label>
                </div>
                <div className="input-wrap">
                  <input
                    type="password"
                    name="password"
                    minLength="4"
                    className="input-field"
                    autoComplete="off"
                    required
                    value={signInData.password}
                    onChange={handleSignInChange}
                  />
                  <label>Password</label>
                </div>
                <input type="submit" value="Sign In" className="sign-btn" />
              </div>
            </form>

          
            <form onSubmit={handleSignUpSubmit} className="sign-up-form">
              <div className="heading">
                <h2>Get Started</h2>
                <h6>Already have an account?</h6>
                <a href="#" className="toggle" onClick={toggleMode}>Sign in</a>
              </div>
              <div className="actual-form">
                <div className="input-wrap">
                  <input
                    type="text"
                    name="name"
                    minLength="4"
                    className="input-field"
                    autoComplete="off"
                    required
                    value={signUpData.name}
                    onChange={handleSignUpChange}
                  />
                  <label>Name</label>
                </div>
                <div className="input-wrap">
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    autoComplete="off"
                    required
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                  />
                  <label>Email</label>
                </div>
                <div className="input-wrap">
                  <input
                    type="password"
                    name="password"
                    minLength="4"
                    className="input-field"
                    autoComplete="off"
                    required
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                  />
                  <label>Password</label>
                </div>
                <input type="submit" value="Sign Up" className="sign-btn" />
              </div>
            </form>
          </div>

          <div className="carousel">
            <div className="text-slider">
              <h2>SKYLINE</h2>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthForm;
