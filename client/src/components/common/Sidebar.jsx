import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  ListItemButton,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import assets from '../../assets';
import boardApi from '../../api/boardApi';
import { setBoards } from '../../redux/features/boardSlice';
import FavouriteList from './FavouriteList';

const Sidebar = () => {
  const user = useSelector((state) => state.user.value);
  const boards = useSelector((state) => state.board.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);

  const sidebarWidth = 250;

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll();
        dispatch(setBoards(res));
      } catch (err) {
        alert(err);
      }
    };
    getBoards();
  }, [boardId, dispatch]);

  const updateActive = useCallback(
    (listBoards) => {
      const index = listBoards.findIndex((item) => item.id === boardId);
      setActiveIndex(index);
    },
    [boardId]
  );

  const onDragEnd = useCallback(
    async ({ source, destination }) => {
      const newList = [...boards];
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      const activeItemIndex = newList.findIndex((item) => item.id === boardId);
      setActiveIndex(activeItemIndex);
      dispatch(setBoards(newList));

      try {
        await boardApi.updatePosition({ boards: newList });
      } catch (err) {
        alert(err);
      }
    },
    [boardId, boards, dispatch]
  );

  useEffect(() => {
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0].id}`);
    }
    updateActive(boards);
  }, [boardId, boards, navigate, updateActive]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const addBoard = useCallback(async () => {
    try {
      const res = await boardApi.create();
      const newList = [res, ...boards];
      dispatch(setBoards(newList));
      navigate(`/boards/${res.id}`);
    } catch (err) {
      alert(err);
    }
  }, [boards, dispatch, navigate]);

  return (
    <Drawer
      container={window.document.body}
      variant="permanent"
      open={true}
      sx={{
        width: sidebarWidth,
        height: '100vh',
        '& > div': {
          borderRight: 'none',
        },
      }}
    >
      <List
        disablePadding
        sx={{
          width: sidebarWidth,
          height: '100vh',
          backgroundColor: assets.colors.secondary,
        }}
      >
        <ListItem>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {user.username}
            </Typography>
            <IconButton onClick={logout}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Box>
        </ListItem>
        <Box sx={{ paddingTop: '10px' }} />
        <FavouriteList />
        <Box sx={{ paddingTop: '10px' }} />
        <ListItem>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Private
            </Typography>
            <IconButton onClick={addBoard}>
              <AddBoxOutlined fontSize="small" />
            </IconButton>
          </Box>
        </ListItem>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            key="list-board-droppable-key"
            droppableId="list-board-droppable"
          >
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {boards.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <ListItemButton
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        selected={index === activeIndex}
                        component={Link}
                        to={`/boards/${item.id}`}
                        sx={{
                          pl: '20px',
                          cursor: snapshot.isDragging
                            ? 'grap'
                            : 'pointer!important',
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.icon} {item.title}
                        </Typography>
                      </ListItemButton>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
    </Drawer>
  );
};

export default Sidebar;
