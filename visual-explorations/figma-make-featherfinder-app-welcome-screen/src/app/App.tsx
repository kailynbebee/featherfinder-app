import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgPaths from '../imports/svg-6dp5rgsc3d';
import imgTimothyDykesANtQKnffAaUnsplash2 from "figma:asset/bb2f3f7f960341f9eb5b051259278d7ad476f26f.png";
import imgTimothyDykesANtQKnffAaUnsplash3 from "figma:asset/940d9ef935ce4a2610d9e8dadabe0536a1562013.png";
import imgZdenekMachacekOlKkCmToXEsUnsplash2 from "figma:asset/aad0b8e9f1d448ea4b4d2de8cdead2cc07b31d8e.png";
import imgAarnGiri3LGi0Bxj1W0Unsplash2 from "figma:asset/9b3e083540fcf4a32efd505208332fccaafd1eda.png";
import { imgTimothyDykesANtQKnffAaUnsplash1, imgZdenekMachacekOlKkCmToXEsUnsplash1, imgAarnGiri3LGi0Bxj1W0Unsplash1 } from "../imports/svg-xqif2";

const birdData = [
  {
    name: "Tropical Royal Flycatcher",
    image: imgAarnGiri3LGi0Bxj1W0Unsplash2,
    mask: imgAarnGiri3LGi0Bxj1W0Unsplash1,
    habitat: "forest",
    position: "center",
    rotation: 4,
    // Positioning for fan layout - rotates around bottom-right pivot
    top: '-5%',
    left: '-15%',
    width: '90%',
    height: '75%',
    zIndex: 30,
  },
  {
    name: "American Flamingo",
    image: imgZdenekMachacekOlKkCmToXEsUnsplash2,
    mask: imgZdenekMachacekOlKkCmToXEsUnsplash1,
    habitat: "grassland",
    position: "left",
    rotation: -1,
    // Behind and more to the right
    top: '5%',
    left: '-20%',
    width: '85%',
    height: '72%',
    zIndex: 10,
  },
  {
    name: "Common Kingfisher",
    image: imgTimothyDykesANtQKnffAaUnsplash2,
    mask: imgTimothyDykesANtQKnffAaUnsplash1,
    habitat: "wetland",
    position: "right",
    rotation: 1,
    // Furthest back and most to the right
    top: '8%',
    left: '5%',
    width: '75%',
    height: '68%',
    zIndex: 20,
  }
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [zipCode, setZipCode] = useState('');

  // Auto-advance carousel with progress
  useEffect(() => {
    const duration = 5000; // 5 seconds per slide
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(current => (current + 1) % birdData.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for zip code:', zipCode);
    // Handle zip code search
  };

  const handleDiscoverNearby = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location:', position.coords.latitude, position.coords.longitude);
          // Handle location-based discovery
        },
        (error) => {
          // Silently handle geolocation errors in prototype
          // In production, you would show a user-friendly message
          console.log('Location access not available, using default location');
        }
      );
    } else {
      // Geolocation not supported
      console.log('Geolocation not supported, using default location');
    }
  };

  const handleLogin = () => {
    console.log('Navigate to login');
    // Handle login navigation
  };

  const handleInfo = () => {
    console.log('Show app info');
    // Show about/explainer overlay
  };

  const currentBird = birdData[currentSlide];

  return (
    <div className="flex flex-col size-full min-h-screen bg-gradient-to-t from-[#f6f0e7] from-[35%] to-[rgba(200,178,146,0.8)] overflow-hidden">
      {/* Fixed Header Elements */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-5 pt-10 pointer-events-none">
        {/* Info Icon */}
        <button 
          onClick={handleInfo}
          className="pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity size-[24px]"
        >
          <svg className="block size-full" fill="none" viewBox="0 0 20.8696 20">
            <g clipPath="url(#clip0_1_47)">
              <path d={svgPaths.p2ffc5280} stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d="M10.4355 9.58337V13.75" stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d={svgPaths.p29d57880} stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
            <defs>
              <clipPath id="clip0_1_47">
                <rect fill="white" height="20" width="20.8696" />
              </clipPath>
            </defs>
          </svg>
        </button>

        {/* Log in Button */}
        <button 
          onClick={handleLogin}
          className="pointer-events-auto flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <p className="font-['Kodchasan:Bold',sans-serif] text-[#006e63] text-[19px] underline">Log in</p>
          <svg className="size-[19px]" fill="none" viewBox="0 0 19 19">
            <g>
              <path d={svgPaths.p308bb80} stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              <path d={svgPaths.p3d504f00} stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </svg>
        </button>
      </div>

      {/* Hero Section with Bird Images - Takes remaining space */}
      <div className="flex-1 relative min-h-0 flex items-end justify-end overflow-hidden">
        {/* Container for all three feather layers positioned around a focal point */}
        <div className="relative w-[calc(80vh*2/5)] h-[80vh] mb-24 mr-[-20%]">
          
          {/* Map through each bird and render its feather - each stays in its fixed position */}
          {birdData.map((bird, index) => {
            const isActive = index === currentSlide;
            
            // For non-active birds, determine if they're 2nd (lighter) or 3rd (darkest) based on z-index
            let visualTreatment = 'active';
            if (!isActive) {
              const otherBirds = birdData.filter((_, i) => i !== currentSlide);
              const sortedByZIndex = otherBirds.sort((a, b) => b.zIndex - a.zIndex);
              visualTreatment = bird.zIndex === sortedByZIndex[0].zIndex ? 'second' : 'third';
            }
            
            // Floating animations for each bird
            const animations = {
              y: [0, -10, 0],
              rotate: [bird.rotation - 1, bird.rotation + 1, bird.rotation - 1]
            };
            
            // Scale based on visual hierarchy
            const scale = isActive ? 1 : visualTreatment === 'second' ? 0.92 : 0.85;

            return (
              <motion.div
                key={`feather-${index}`}
                className="absolute"
                style={{
                  top: bird.top,
                  left: bird.left,
                  width: bird.width,
                  height: bird.height,
                  zIndex: isActive ? 50 : bird.zIndex,
                  transformOrigin: 'bottom right',
                  rotate: `${bird.rotation}deg`,
                }}
                animate={{
                  ...animations,
                  scale: scale
                }}
                transition={{ 
                  duration: 7 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    maskImage: `url('${bird.mask}')`,
                    maskSize: 'contain',
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat'
                  }}
                >
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <img 
                      alt="" 
                      className="absolute max-w-none object-cover size-full" 
                      src={bird.image} 
                    />
                    {/* Active bird gets minimal treatment, background birds get teal overlays */}
                    <AnimatePresence>
                      {isActive ? (
                        <motion.div 
                          key={`active-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <div className="absolute bg-[rgba(237,51,0,0.3)] inset-0 mix-blend-saturation" />
                          <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0 mix-blend-soft-light" />
                          <div className="absolute bg-gradient-to-b from-[rgba(255,255,255,0)] inset-0 mix-blend-hard-light to-black" />
                        </motion.div>
                      ) : visualTreatment === 'second' ? (
                        <motion.div 
                          key={`background-left-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <div className="absolute bg-[rgba(0,142,130,0.8)] inset-0" />
                          <div className="absolute bg-[rgba(255,255,255,0.1)] inset-0 mix-blend-lighten" />
                          <div className="absolute bg-[#008e82] inset-0 mix-blend-color" />
                          <div className="absolute bg-size-[453px_453px] bg-top-left inset-0 mix-blend-overlay opacity-20" style={{ backgroundImage: `url('${imgTimothyDykesANtQKnffAaUnsplash3}')` }} />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key={`background-right-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0"
                        >
                          <div className="absolute bg-[rgba(0,110,99,0.8)] inset-0" />
                          <div className="absolute bg-[rgba(255,255,255,0.3)] inset-0 mix-blend-lighten" />
                          <div className="absolute bg-[#006e63] inset-0 mix-blend-color" />
                          <div className="absolute bg-size-[453px_453px] bg-top-left inset-0 mix-blend-overlay opacity-20" style={{ backgroundImage: `url('${imgTimothyDykesANtQKnffAaUnsplash3}')` }} />
                          <div className="absolute bg-[rgba(0,0,0,0.35)] inset-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* Bottom Content - Fixed at bottom */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-5 pb-8 pt-4">
        {/* Bird Name */}
        <motion.p 
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="font-['Kodchasan:Medium',sans-serif] text-[#4e3626] text-[14px] text-center w-full max-w-[800px]"
        >
          {currentBird.name}
        </motion.p>

        {/* Carousel Indicator */}
        <div className="flex items-center gap-[9px]">
          {birdData.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setProgress(0);
              }}
              className="relative cursor-pointer"
            >
              {index === currentSlide ? (
                <div className="bg-[rgba(200,178,146,0.8)] flex h-[7px] rounded-[8px] w-[42px] overflow-hidden">
                  <motion.div 
                    className="bg-[#c8b292] h-[7px] rounded-bl-[8px] rounded-tl-[8px]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : (
                <div className="bg-[rgba(200,178,146,0.5)] h-[7px] rounded-[8px] w-[10px]" />
              )}
            </button>
          ))}
        </div>

        {/* Search Container */}
        <form onSubmit={handleSearch} className="w-full max-w-[800px]">
          <div className="bg-white flex items-center gap-4 px-6 py-4 rounded-[14px] shadow-[0px_0px_33px_3px_rgba(74,55,40,0.05)]">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Search by zip code"
              className="flex-1 font-['Kodchasan:Medium',sans-serif] text-[19px] text-[rgba(78,54,38,0.6)] bg-transparent outline-none placeholder:text-[rgba(78,54,38,0.6)]"
            />
            <button type="submit" className="shrink-0 size-[24px] cursor-pointer hover:opacity-80 transition-opacity">
              <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                <g>
                  <path d="M17 17L21 21" stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  <path d={svgPaths.pd0e7600} stroke="#006E63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </g>
              </svg>
            </button>
          </div>
        </form>

        {/* Discover CTA */}
        <button 
          onClick={handleDiscoverNearby}
          className="font-['Kodchasan:Bold',sans-serif] text-[#006e63] text-[20px] text-center underline cursor-pointer hover:opacity-80 transition-opacity w-full max-w-[800px]"
        >
          Discover birds near you
        </button>
      </div>
    </div>
  );
}