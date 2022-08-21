import { useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Picker } from 'emoji-mart';

import 'emoji-mart/css/emoji-mart.css';

const EmojiPicker = (props) => {
  const [selectedEmoji, setSelectedEmoji] = useState();
  const [isShowPicker, setIsShowPicker] = useState(false);

  useEffect(() => {
    setSelectedEmoji(props.icon);
  }, [props.icon]);

  const selectEmoji = useCallback(
    (e) => {
      const sym = e.unified.split('-');
      const codesArray = [];
      sym.forEach((el) => codesArray.push('0x' + el));
      const emoji = String.fromCodePoint(...codesArray);
      setIsShowPicker(false);
      props.onChange(emoji);
    },
    [props]
  );

  const showPicker = useCallback(() => {
    setIsShowPicker((value) => !value);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: 'max-content',
      }}
    >
      <Typography
        variant="h3"
        fontWeight="700"
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={showPicker}
      >
        {selectedEmoji}
      </Typography>
      <Box
        sx={{
          display: isShowPicker ? 'block' : 'none',
          position: 'absolute',
          top: '100%',
          zIndex: 3,
        }}
      >
        <Picker theme="dark" onSelect={selectEmoji} showPreview={false} />
      </Box>
    </Box>
  );
};

export default EmojiPicker;
