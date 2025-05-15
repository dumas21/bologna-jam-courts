
import { motion } from 'framer-motion';

const Logo = () => {
  return (
    <motion.div 
      className="w-full max-w-xs mx-auto my-6"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img 
        src="/lovable-uploads/08dab4be-24fd-4800-b7b1-7f55a6d6de3d.png" 
        alt="Playground Jam Bologna Logo" 
        className="w-full h-auto pixel-border rounded-md shadow-lg"
      />
    </motion.div>
  );
};

export default Logo;
