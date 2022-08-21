import { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setBoards } from '../redux/features/boardSlice';
import boradApi from '../api/boardApi';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const createBoard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await boradApi.create();
      dispatch(setBoards([res]));
      navigate(`/boards/${res.id}`);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoadingButton
        variant="outlined"
        color="success"
        onClick={createBoard}
        loading={loading}
      >
        Click here to create your first board
      </LoadingButton>
    </Box>
  );
};

export default Home;
