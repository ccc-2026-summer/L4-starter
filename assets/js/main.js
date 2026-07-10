const workItems = document.querySelectorAll('.work-item');

workItems.forEach((item) => {
  const degree = Math.random() * 360;
  item.style.transform = `rotate(${degree}deg)`;

  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  item.style.left = `${x}px`;
  item.style.top = `${y}px`;

  item.addEventListener('mouseenter', () => {
    const video = item.querySelector('video');
    if (video) video.play();
  });

  item.addEventListener('mouseleave', () => {
    const video = item.querySelector('video');
    if (video) video.pause();
  });
});
