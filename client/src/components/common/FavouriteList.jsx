import React, { useState, useEffect, useCallback } from 'react';
import { ListItem, ListItemButton, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import boardApi from '../../api/boardApi';
import { setFavouriteList } from '../../redux/features/favouriteSlice';

const FavouriteList = () => {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.favourites.value);
  const [activeIndex, setActiveIndex] = useState(0);
  const { boardId } = useParams();

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getFavourites();
        dispatch(setFavouriteList(res));
      } catch (err) {
        alert(err);
      }
    };
    getBoards();
  }, [dispatch]);

  useEffect(() => {
    const index = list.findIndex((item) => item.id === boardId);
    setActiveIndex(index);
  }, [boardId, list]);

  const onDragEnd = useCallback(
    async ({ source, destination }) => {
      const newList = [...list];
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      const activeItemIndex = newList.findIndex((item) => item.id === boardId);
      setActiveIndex(activeItemIndex);
      dispatch(setFavouriteList(newList));

      try {
        await boardApi.updateFavouritePosition({ boards: newList });
      } catch (err) {
        alert(err);
      }
    },
    [boardId, list, dispatch]
  );

  return (
    <>
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
            Favourites
          </Typography>
        </Box>
      </ListItem>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          key="list-board-droppable-key"
          droppableId="list-board-droppable"
        >
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {list.map((item, index) => (
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
    </>
  );
};

export default FavouriteList;
