import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import gsap from 'gsap';

export default function Home() {
  const [completedGames, setCompletedGames] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (completedGames >= 3) {
      setTimeout(() => setShowAnimation(true), 500);
    }
  }, [completedGames]);

  return (
<div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6 font-sans text-white overflow-hidden">
      <FireworkBackground />
      {!showAnimation ? (
        <GameContainer completedGames={completedGames} setCompletedGames={setCompletedGames} />
      ) : (
        <motion.div
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <h1 className="text-5xl md:text-7xl text-pink-300 mb-8 font-extrabold animate-bounce ">
            🎉 Happy Birthday Mother! 🎉
          </h1>
          <div className="w-full h-2/3">
            <Spline scene="https://prod.spline.design/dpjdm8iyx-SOLhBm/scene.splinecode" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FireworkBackground() {
  useEffect(() => {
    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      document.querySelector('.firework-container').appendChild(particle);
      gsap.set(particle, {
        left: x,
        top: y,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        borderRadius: '50%',
        boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      });
      const angle = Math.random() * 360;
      const distance = Math.random() * 100 + 50;
      const vx = Math.cos(angle * Math.PI / 180) * distance;
      const vy = Math.sin(angle * Math.PI / 180) * distance;
      gsap.to(particle, {
        x: vx,
        y: vy,
        opacity: 0,
        duration: 1.5,
        delay: Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    };

    const createFirework = () => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      for (let i = 0; i < 20; i++) {
        createParticle(x, y);
      }
    };

    const interval = setInterval(createFirework, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="firework-container fixed inset-0 pointer-events-none z-0">
      <style>
        {`
          .particle {
            position: absolute;
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
}

function GameContainer({ completedGames, setCompletedGames }) {
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    const gameOrder = ['balloons', 'flowers', 'memory'];
    setCurrentGame(gameOrder[completedGames] || null);
  }, [completedGames]);

  if (!currentGame) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <FireworkBackground />
      {currentGame === 'balloons' && (
        <FallingBalloonsGame onComplete={() => setCompletedGames((prev) => prev + 1)} />
      )}
      {currentGame === 'flowers' && (
        <CatchingFlowersGame onComplete={() => setCompletedGames((prev) => prev + 1)} />
      )}
      {currentGame === 'memory' && (
        <MemoryMatchGame onComplete={() => setCompletedGames((prev) => prev + 1)} />
      )}
    </div>
  );
}

function FallingBalloonsGame({ onComplete }) {
  const [balloons, setBalloons] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons((prev) => [...prev, { id: Date.now() }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const popBalloon = (id) => {
    gsap.to(`#balloon-${id}`, {
      scale: 1.2,
      duration: 0.1,
      onComplete: () => {
        gsap.to(`#balloon-${id}`, {
          y: -100,
          scale: 0,
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            setBalloons((prev) => prev.filter((b) => b.id !== id));
          },
        });
      },
    });
    const newCount = poppedCount + 1;
    setPoppedCount(newCount);
    if (newCount >= 10) {
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-full" 
         style={{ cursor: "url('https://res.cloudinary.com/dtwa3lxdk/image/upload/v1752329715/pin_wbyto3.png') 16 16 , crosshair" }}>
      <h2 className="text-center text-3xl font-bold mb-4 text-white mt-20">
        🎈 Click Balloons! ({poppedCount}/10)
      </h2>
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          id={`balloon-${balloon.id}`}
          onClick={() => popBalloon(balloon.id)}
          initial={{ y: -100, x: Math.random() * window.innerWidth }}
          animate={{ y: window.innerHeight + 100 }}
          transition={{ duration: 5, ease: 'linear' }}
          className="absolute w-12 h-20"
        >
          <img src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1752329715/balloon_ufwkup.png" alt="balloon" className="w-full h-full object-contain" />
        </motion.div>
      ))}
    </div>
  );
}

function CatchingFlowersGame({ onComplete }) {
  const [flowers, setFlowers] = useState([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [basketX, setBasketX] = useState(window.innerWidth / 2);
  const basketRef = useRef();
  const flowerRef = useRef({});
  const animationFrameRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowers((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (window.innerWidth - 50),
          y: 0,
          rotate: 0,
          rotateSpeed: (Math.random() - 0.5) * 2,
          caught: false,
        },
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setBasketX((x) => Math.max(x - 20, 0));
      if (e.key === 'ArrowRight') setBasketX((x) => Math.min(x + 20, window.innerWidth - 64));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const animate = () => {
      setFlowers((prev) =>
        prev
          .map((flower) => {
            if (flower.caught) return flower;
            const el = flowerRef.current[flower.id];
            if (!el) return flower;

            const rect = el.getBoundingClientRect();
            const basketRect = basketRef.current?.getBoundingClientRect();

            if (
              basketRect &&
              rect.bottom > basketRect.top &&
              rect.right > basketRect.left &&
              rect.left < basketRect.right
            ) {
              setCaughtCount((c) => c + 1);
              return { ...flower, caught: true };
            }

            if (rect.top > window.innerHeight) return null;

            return {
              ...flower,
              y: flower.y + 5,
              rotate: flower.rotate + flower.rotateSpeed,
            };
          })
          .filter(Boolean)
      );
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [flowers]);

  useEffect(() => {
    if (caughtCount >= 16) onComplete();
  }, [caughtCount]);

  return (
    <div className="relative w-full h-full">
      <h2 className="text-center text-3xl font-bold mb-4 text-white mt-20">
        🌸 Catch 16 Flowers! ({caughtCount}/16)
      </h2>
      {flowers.map((flower) =>
        !flower.caught ? (
          <div
            key={flower.id}
            ref={(el) => (flowerRef.current[flower.id] = el)}
            className="absolute w-10 h-10"
            style={{
              left: flower.x,
              top: flower.y,
              transform: `rotate(${flower.rotate}deg)`,
            }}
          >
            <img src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1752329715/rose_n1ua67.png" alt="flower" className="w-full h-full object-contain" />
          </div>
        ) : null
      )}
      <div
        ref={basketRef}
        className="absolute bottom-24 w-32 h-16"
        style={{ left: basketX }}
      >
        <img src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1752329716/wicker-basket_lfwqr1.png" alt="basket" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

function MemoryMatchGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const emojis = ['🍰', '🎁', '🎈', '🌹', '🍫', '🧸'];
    const duplicated = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    const prepared = duplicated.map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
    }));
    setCards(prepared);
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched((prev) => [...prev, cards[first].emoji]);
      }
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card, i) => {
            if (i === first || i === second) return { ...card, flipped: false };
            return card;
          })
        );
        setFlipped([]);
      }, 1000);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === 6) {
      setTimeout(onComplete, 1000);
    }
  }, [matched]);

  const handleClick = (index) => {
    if (flipped.length < 2 && !cards[index].flipped) {
      setFlipped([...flipped, index]);
      setCards((prev) =>
        prev.map((card, i) => (i === index ? { ...card, flipped: true } : card))
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-white">
      <h2 className="text-3xl font-bold mb-6">🧠 Match the Birthday Emojis!</h2>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            onClick={() => handleClick(i)}
            animate={{ rotateY: card.flipped || matched.includes(card.emoji) ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-20 h-24 rounded-lg cursor-pointer"
            style={{ position: 'relative', transformStyle: 'preserve-3d' }}
          >
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'gray',
                borderRadius: '0.5rem',
              }}
            >
              ❓
            </div>
            <div
              style={{
                backfaceVisibility: 'hidden',
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'pink',
                transform: 'rotateY(180deg)',
                borderRadius: '0.5rem',
              }}
            >
              {card.emoji}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}