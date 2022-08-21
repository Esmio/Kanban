import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, TextField } from '@mui/material';
import {
  StarOutlined,
  StarBorderOutlined,
  DeleteOutlined,
} from '@mui/icons-material';

import EmojiPicker from '../components/common/EmojiPicker';
import Kanban from '../components/common/Kanban';
import { setBoards } from '../redux/features/boardSlice';
import { setFavouriteList } from '../redux/features/favouriteSlice';
import boardApi from '../api/boardApi';

let timer;
let timeout = 500;

const Board = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [icon, setIcon] = useState('');

  const boards = useSelector((state) => state.board.value);
  const favouriteList = useSelector((state) => state.favourites.value);

  useEffect(() => {
    const getBoard = async () => {
      try {
        const res = await boardApi.getOne(boardId);
        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsFavourite(res.favourite);
        setIcon(res.icon);
      } catch (err) {
        alert(JSON.stringify(err));
      }
    };
    getBoard();
  }, [boardId]);

  const onIconChange = useCallback(
    async (newIcon) => {
      let temp = [...boards];
      const index = temp.findIndex((item) => item.id === boardId);
      temp[index] = { ...temp[index], icon: newIcon };

      if (isFavourite) {
        let tempFavourite = [...favouriteList];
        const favouriteIndex = tempFavourite.findIndex(
          (item) => item.id === boardId
        );
        tempFavourite[favouriteIndex] = {
          ...tempFavourite[index],
          icon: newIcon,
        };
        dispatch(setFavouriteList(tempFavourite));
      }

      setIcon(newIcon);
      dispatch(setBoards(temp));
      try {
        await boardApi.update(boardId, { icon: newIcon });
      } catch (err) {
        alert(err);
      }
    },
    [boardId, boards, dispatch, favouriteList, isFavourite]
  );

  const updateTitle = useCallback(
    (e) => {
      clearTimeout(timer);
      const newTitle = e.target.value;
      setTitle(newTitle);
      let temp = [...boards];
      const index = temp.findIndex((item) => item.id === boardId);
      temp[index] = { ...temp[index], title: newTitle };
      if (isFavourite) {
        let tempFavourite = [...favouriteList];
        const favouriteIndex = tempFavourite.findIndex(
          (item) => item.id === boardId
        );
        tempFavourite[favouriteIndex] = {
          ...tempFavourite[index],
          title: newTitle,
        };
        dispatch(setFavouriteList(tempFavourite));
      }
      dispatch(setBoards(temp));
      timer = setTimeout(async () => {
        try {
          await boardApi.update(boardId, { title: newTitle });
        } catch (err) {
          alert(err);
        }
      }, timeout);
    },
    [boardId, boards, dispatch, favouriteList, isFavourite]
  );

  const updateDescription = useCallback(
    (e) => {
      clearTimeout(timer);
      const newDescription = e.target.value;
      setDescription(newDescription);
      let temp = [...boards];
      const index = temp.findIndex((item) => item.id === boardId);
      temp[index] = { ...temp[index], description: newDescription };
      dispatch(setBoards(temp));
      timer = setTimeout(async () => {
        try {
          await boardApi.update(boardId, { description: newDescription });
        } catch (err) {
          alert(err);
        }
      }, timeout);
    },
    [boardId, boards, dispatch]
  );

  const addFavourite = useCallback(async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite });
      setIsFavourite(!isFavourite);
      let newFavouriteList = [...favouriteList];
      if (isFavourite) {
        // eslint-disable-next-line no-unused-vars
        newFavouriteList = newFavouriteList.filter(
          (item) => item.id !== boardId
        );
      } else {
        newFavouriteList.unshift(board);
      }
      dispatch(setFavouriteList(newFavouriteList));
    } catch (err) {
      alert(err);
    }
  }, [boardId, dispatch, favouriteList, isFavourite]);

  const deleteBoard = useCallback(async () => {
    try {
      await boardApi.delete(boardId);
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter(
          (item) => item.id !== boardId
        );
        dispatch(setFavouriteList(newFavouriteList));
      }
      const newList = boards.filter((item) => item.id !== boardId);
      if (newList.length === 0) {
        navigate('/boards');
      } else {
        navigate(`/boards/${newList[0].id}`);
      }
      dispatch(setBoards(newList));
    } catch (err) {
      alert(err);
    }
  }, [boardId, boards, dispatch, favouriteList, isFavourite, navigate]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <IconButton variant="outlined" onClick={addFavourite}>
          {isFavourite ? (
            <StarOutlined color="warning" />
          ) : (
            <StarBorderOutlined />
          )}
        </IconButton>
        <IconButton variant="outlined" color="error" onClick={deleteBoard}>
          <DeleteOutlined />
        </IconButton>
      </Box>
      <Box sx={{ padding: '10px 50px' }}>
        <Box>
          <EmojiPicker icon={icon} onChange={onIconChange} />
          <TextField
            value={title}
            onChange={updateTitle}
            placeholder="Untitled"
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
              '& .MuiOutlinedInput-root': {
                fontSize: '2rem',
                fontWeight: '700',
              },
            }}
          />
          <TextField
            value={description}
            onChange={updateDescription}
            placeholder="Add a description"
            variant="outlined"
            multiline
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8rem',
              },
            }}
          />
        </Box>
        <Box>
          {/* kanban board */}
          <Kanban data={sections} boardId={boardId} />
        </Box>
      </Box>
    </>
  );
};

export default Board;
