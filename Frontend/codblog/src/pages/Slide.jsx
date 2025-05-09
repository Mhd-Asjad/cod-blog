import React, { useState } from 'react'
import { motion } from 'motion/react'

const Slide = () => {
    const [activeIndex, setActiveIndex] = useState(0)

    const handleClick = (index) => {
        setActiveIndex(index)
    }
    return (
        <div className='flex justify-center items-center h-screen'>
          <div className="relative flex p-3 rounded-lg gap-5 text-white text-center bg-[#0E1616] font-semibold border border-black">
            {/* Background sliding container */}
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-[#FF0088] rounded-lg text-center"
              style={{
                width: `calc(100% / 4)`, // Adjust width based on number of items
                transform: `translateX(${activeIndex * 100}%)`, // Slide effect based on active index
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
    
            {['Home', 'React', 'Vue', 'Svelte'].map((item, index) => (
              <motion.p
                key={index}
                onTap={() => handleClick(index)} // Update the active item on click
                className="relative z-10 px-4 py-2"
                whileTap={{ scale: 1.1 }} // Slight scale effect on tap
              >
                {item}
              </motion.p>
            ))}
          </div>
        </div>
      );
    };
    
    export default Slide;
