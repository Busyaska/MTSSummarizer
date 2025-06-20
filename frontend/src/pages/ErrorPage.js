import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

/**
 * ErrorPage —  страница 404 с анимированными шарами.
 *
 * Как работает:
 * Рисует на полном экране канвасе белый фон и красный текст
 * Создаёт 7 красных шаров, которые плавают по экрану.
 * С помощью clip() внутри каждого шара перерисовывает текст белым, где круг перекрывает буквы.
 * Выводит кнопку «Вернуться на главную», которая при клике направляет пользователя на «/».
 */
export default function ErrorPage() {
  // ссылка на DOM-элемент <canvas>
  const canvasRef = useRef(null);
  // хук навигации из React Router
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;               // если вдруг нет канваса — выходим
    const ctx = canvas.getContext('2d');
    if (!ctx) return;                  // если нет контекста — выходим

    let rafId;

    //инициализируем 7 шаров с рандомными координатами, скоростью и радиусом
    const bubbles = Array.from({ length: 7 }).map(() => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  80 + Math.random() * 100,
      dx: (Math.random() - 0.5) * 2,   // скорость по X
      dy: (Math.random() - 0.5) * 2    // скорость по Y
    }));

    /**
     * resize() — устанавливает размер <canvas> в размеры окна и обновляет его при изменении окна.
     */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize(); 

    /**
     * draw() — цикл анимации, выполняется через requestAnimationFrame.
     * Очищает и закрашивает фон в белый.
     * Рисует красный текст 
     * Рисует красные шары поверх текста.
     * Для каждого шара создаёт клип-область и перерисовывает тексты белым внутри круга.
     * Перемещает шары, оборачивая их по краям экрана.
     */
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const bigFont   = Math.floor(h / 3);
      const smallFont = Math.floor(h / 20);

      // Белый фон
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);

      // Красный текст по центру
      ctx.fillStyle    = '#ED1C24';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `${bigFont}px sans-serif`;
      ctx.fillText('404', cx, cy);
      ctx.font         = `${smallFont}px sans-serif`;
      ctx.fillText('Страница не найдена', cx, cy + h / 5);

      //Красные шары
      ctx.fillStyle = '#ED1C24';
      bubbles.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      //Прорисовываем белый текст в шарах
      bubbles.forEach(b => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#fff';
        ctx.font       = `${bigFont}px sans-serif`;
        ctx.fillText('404', cx, cy);
        ctx.font       = `${smallFont}px sans-serif`;
        ctx.fillText('Страница не найдена', cx, cy + h / 5);

        ctx.restore();
      });

      //обновляем позиции шаров (wrap-around на границах)
      bubbles.forEach(b => {
        b.x += b.dx;
        b.y += b.dy;
        if (b.x - b.r > w)      b.x = -b.r;
        if (b.x + b.r < 0)      b.x = w + b.r;
        if (b.y - b.r > h)      b.y = -b.r;
        if (b.y + b.r < 0)      b.y = h + b.r;
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();  // старт анимации

    //очистка
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="error-page-wrapper">
      {/* Полноэкранный канвас с анимацией */}
      <canvas ref={canvasRef} className="error-canvas" />

      {/* Кнопка перехода на главную */}
      <button
        className="home-button"
        onClick={() => navigate('/')}
      >
        Вернуться на главную
      </button>
    </div>
  );
}
