import { useCallback, useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import authApi from '../api/authApi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [usernameErrText, setUsernameErrText] = useState('');
  const [passwordErrText, setPasswordErrText] = useState('');

  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setUsernameErrText('');
      setPasswordErrText('');

      const data = new FormData(e.target);
      const username = data.get('username').trim();
      const password = data.get('password').trim();

      let err = false;
      if (username === '') {
        err = true;
        setUsernameErrText('Please fill this field');
      }
      if (password === '') {
        err = true;
        setPasswordErrText('Please fill this field');
      }
      if (err) return;

      setLoading(true);

      try {
        const res = await authApi.login({
          username,
          password,
        });
        setLoading(false);
        localStorage.setItem('token', res.token);
        navigate('/');
      } catch (error) {
        const errors = error.data.errors;
        errors.forEach((e) => {
          if (e.param === 'username') {
            setUsernameErrText(e.msg);
          }
          if (e.param === 'password') {
            setPasswordErrText(e.msg);
          }
        });
        setLoading(false);
      }
    },
    [navigate]
  );

  return (
    <>
      <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          disabled={loading}
          error={usernameErrText !== ''}
          helperText={usernameErrText}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="Password"
          name="password"
          type="password"
          disabled={loading}
          error={passwordErrText !== ''}
          helperText={passwordErrText}
        />
        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant="outlined"
          fullWidth
          color="success"
          type="submit"
          loading={loading}
        >
          Login
        </LoadingButton>
        <Button component={Link} to="/signup" sx={{ transform: 'none' }}>
          Don't have an account? Signup
        </Button>
      </Box>
    </>
  );
};

export default Login;
