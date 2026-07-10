// js 的註解符號有兩種，一種是雙斜線，一次註解單行

/* 另一種是可以一次註解多行（符號和 css 一樣）
快捷鍵是 command option / */

const workItems = document.querySelectorAll('.work-item');

workItems.forEach((item) => {
  const degree = Math.random() * 360;
  item.style.transform = `rotate(${degree}deg)`;

  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  item.style.left = `${x}px`;
  item.style.top = `${y}px`;

  item.addEventListener('mouseenter', (event) => {
    const video = item.querySelector('video');
    video.play();
  })
});
