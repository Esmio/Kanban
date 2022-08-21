import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Backdrop,
  Modal,
  Fade,
  Box,
  IconButton,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import Moment from 'moment';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import taskApi from '../../api/taskApi';

import '../../css/custom-editor.css';

const modalStyle = {
  outline: 'none',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  p: 1,
  height: '80%',
};

let timer = null;
const timeout = 500;
let isModalClosed = false;

const TaskModal = (props) => {
  const boardId = props.boardId;
  const [task, setTask] = useState(props.task);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const editorWrapperRef = useRef();

  const updateEditorHeight = useCallback(() => {
    setTimeout(() => {
      const box = editorWrapperRef.current;
      box.querySelector('.ck-editor__editable_inline').style.height =
        box.offsetHeight - 50 + 'px';
    }, timeout);
  }, []);

  useEffect(() => {
    setTask(props.task);
    setTitle(props.task?.title ?? '');
    setContent(props.task?.content ?? '');
    if (props.task !== undefined) {
      isModalClosed = false;
      updateEditorHeight();
    }
  }, [props.task, updateEditorHeight]);

  const onClose = useCallback(() => {
    isModalClosed = true;
    props.onUpdate(task);
    props.onClose();
  }, [props, task]);

  const deleteTask = useCallback(async () => {
    try {
      await taskApi.delete(boardId, task.id);
      props.onDelete(task);
      setTask(undefined);
    } catch (err) {
      alert(err);
    }
  }, [boardId, props, task]);

  const updateTitle = useCallback(
    (e) => {
      clearTimeout(timer);
      const newTitle = e.target.value;
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, { title: newTitle });
        } catch (err) {
          alert(err);
        }
      }, timeout);
      task.title = newTitle;
      setTitle(newTitle);
      props.onUpdate(task);
    },
    [boardId, props, task]
  );

  const updateContent = useCallback(
    (event, editor) => {
      clearTimeout(timer);
      const data = editor.getData();

      if (!isModalClosed) {
        timer = setTimeout(async () => {
          try {
            await taskApi.update(boardId, task.id, { content: data });
          } catch (err) {
            alert(err);
          }
        }, timeout);

        task.content = data;
        setContent(data);
        props.onUpdate(task);
      }
    },
    [boardId, props, task]
  );

  return (
    <Modal
      open={task !== undefined}
      onClose={onClose}
      closeAfterTransition
      components={{
        Backdrop: Backdrop,
      }}
      componentsProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={task !== undefined}>
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <IconButton variant="outlined" color="error" onClick={deleteTask}>
              <DeleteOutline />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              padding: '2rem 5rem 5rem',
            }}
          >
            <TextField
              value={title}
              placeholder="Untitled"
              onChange={updateTitle}
              variant="outlined"
              fullWidth
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-input': { padding: 0 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
                '& .MuiOutlinedInput-root': {
                  fontSize: '2.5rem',
                  fontWeight: '700',
                },
              }}
            />
            <Typography variant="body2" fontWeight="700">
              {task !== undefined
                ? Moment(task.createTime).format('YYYY-MM-DD')
                : ''}
            </Typography>
            <Divider sx={{ margin: '1.5rem 0' }} />
            <Box
              ref={editorWrapperRef}
              sx={{
                position: 'relative',
                height: '80%',
                overflowX: 'hidden',
                overflowY: 'auto',
              }}
            >
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={updateContent}
                onFocus={updateEditorHeight}
                onBlur={updateEditorHeight}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default TaskModal;
