import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  TextField,
  IconButton,
  Card,
} from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { AddOutlined, DeleteOutlined } from '@mui/icons-material';

import TaskModal from './TaskModal';

import sectionApi from '../../api/sectionApi';
import taskApi from '../../api/taskApi';

let timer;
const timeout = 1000;

const Kanban = (props) => {
  const { boardId } = props;
  const [data, setData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(undefined);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const onDragEnd = useCallback(
    async ({ source, destination }) => {
      if (!destination) return;
      const sourceColIndex = data.findIndex(
        (item) => item.id === source.droppableId
      );
      const destinationColIndex = data.findIndex(
        (item) => item.id === destination.droppableId
      );
      const sourceCol = data[sourceColIndex];
      const destinationCol = data[destinationColIndex];

      const sourceSectionId = sourceCol.id;
      const destinationSectionId = destinationCol.id;

      const sourceTasks = [...sourceCol.tasks];
      const destinationTasks = [...destinationCol.tasks];

      if (source.droppableId !== destination.droppableId) {
        const [removed] = sourceTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, removed);
        data[sourceColIndex].tasks = sourceTasks;
        data[destinationColIndex].tasks = destinationTasks;
      } else {
        const [removed] = destinationTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, removed);
        data[destinationColIndex].tasks = sourceTasks;
      }

      try {
        await taskApi.updatePosition(boardId, {
          resourceList: sourceTasks,
          destinationList: destinationTasks,
          resourceSectionId: sourceSectionId,
          destinationSectionId: destinationSectionId,
        });
        setData(data);
      } catch (err) {
        alert(err);
      }
    },
    [boardId, data]
  );

  const createSection = useCallback(async () => {
    try {
      const section = await sectionApi.create(boardId);
      setData([...data, section]);
    } catch (err) {
      alert(err);
    }
  }, [boardId, data]);

  const deleteSection = useCallback(
    (sectionId) => async () => {
      try {
        await sectionApi.delete(boardId, sectionId);
        const newData = [...data].filter((item) => item.id !== sectionId);
        setData(newData);
      } catch (err) {
        alert(err);
      }
    },
    [boardId, data]
  );

  const updateSectionTitle = useCallback(
    (sectionId) => (e) => {
      clearTimeout(timer);
      const newTitle = e.target.value;
      const newData = [...data];
      const index = newData.findIndex((item) => item.id === sectionId);
      newData[index].title = newTitle;
      setData(newData);
      timer = setTimeout(async () => {
        try {
          await sectionApi.update(boardId, sectionId, { title: newTitle });
        } catch (err) {
          alert(err);
        }
      }, timeout);
    },
    [boardId, data]
  );

  const createTask = useCallback(
    (sectionId) => async () => {
      const task = await taskApi.create(boardId, {
        sectionId,
      });
      const newData = [...data];
      const index = newData.findIndex((item) => item.id === sectionId);
      newData[index].tasks.unshift(task);
      setData(newData);
    },
    [boardId, data]
  );

  const handleModalClose = useCallback(() => {
    setSelectedTask(undefined);
  }, []);

  const onUpdateTask = useCallback(
    (task) => {
      const newData = [...data];
      const sectionIndex = newData.findIndex(
        (item) => item.id === task.section.id
      );
      const taskIndex = newData[sectionIndex].tasks.findIndex(
        (item) => item.id === task.id
      );
      newData[sectionIndex].tasks[taskIndex] = task;
      setData(newData);
    },
    [data]
  );

  const onDeleteTask = useCallback(
    (task) => {
      const newData = [...data];
      const sectionIndex = newData.findIndex(
        (item) => item.id === task.section.id
      );
      const taskIndex = newData[sectionIndex].tasks.findIndex(
        (item) => item.id === task.id
      );
      newData[sectionIndex].tasks.splice(taskIndex, 1);
      setData(newData);
    },
    [data]
  );

  const handleTaskSelected = useCallback(
    (task) => () => {
      setSelectedTask(task);
    },
    []
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={createSection}>Add section</Button>
        <Typography variant="body2" fontWeight={700}>
          {data.length} sections
        </Typography>
      </Box>
      <Divider sx={{ margin: '10px 0' }} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: 'flex',
            width: 'calc(100vw - 400px)',
            overflowX: 'auto',
          }}
        >
          {data.map((section) => (
            <div key={section.id} style={{ width: '300px' }}>
              <Droppable key={section.id} droppableId={section.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      width: '300px',
                      padding: '10px',
                      marginRight: '10px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                      }}
                    >
                      <TextField
                        value={section.title}
                        placeholder="Untitled"
                        onChange={updateSectionTitle(section.id)}
                        variant="outlined"
                        sx={{
                          flexGrow: 1,
                          '& .MuiOutlinedInput-input': { padding: 0 },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'unset',
                          },
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1rem',
                            fontWeight: '700',
                          },
                        }}
                      />
                      <IconButton
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'gray',
                          '&:hover': {
                            color: 'green',
                          },
                        }}
                        onClick={createTask(section.id)}
                      >
                        <AddOutlined />
                      </IconButton>
                      <IconButton
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'gray',
                          '&:hover': {
                            color: 'red',
                          },
                        }}
                        onClick={deleteSection(section.id)}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </Box>
                    {/* tasks */}
                    {section.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              padding: '10px',
                              marginBottom: '10px',
                              cursor: snapshot.isDragging
                                ? 'grab'
                                : 'pointer!important',
                            }}
                            onClick={handleTaskSelected(task)}
                          >
                            <Typography>
                              {task.title ? task.title : 'Untitled'}
                            </Typography>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </div>
          ))}
        </Box>
      </DragDropContext>
      <TaskModal
        task={selectedTask}
        boardId={boardId}
        onClose={handleModalClose}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
      />
    </>
  );
};

export default Kanban;
