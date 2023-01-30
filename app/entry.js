'use strict';
import $ from 'jquery';
globalThis.jQuery = $;
import bootstrap from 'bootstrap';

const buttonSelfComment = $('#self-comment-button');
buttonSelfComment.on('click', () => {
  const roomId = buttonSelfComment.data('room-id');
  const userId = buttonSelfComment.data('user-id');
  const comment = prompt('コメントを255字以内で入力してください。');
  if (comment) {
    $.post(`/rooms/${roomId}/users/${userId}/comments`,
      { comment: comment },
      (data) => {
        $('#self-comment').text(data.comment);
      });
  }
});

const buttonDeleteMusic = $('#delete-btn');
buttonDeleteMusic.on('click', () => {
  const roomId = buttonDeleteMusic.data('room-id');
  const musicId = buttonDeleteMusic.data('music-id');
  let result = confirm('削除してもよろしいですか？');
  if (result) {
    $.post(`/rooms/${roomId}/music/${musicId}?delete=1`,
      { result: result })
  }
});
