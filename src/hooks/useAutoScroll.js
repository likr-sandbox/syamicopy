import { useEffect } from 'react';
import { STEP_WIDTH } from '../utils/constants';

export const useAutoScroll = (gridRef, bunkafuRef, currentStep, _isPlaying) => {
  useEffect(() => {
    if (!gridRef.current || currentStep < 0) return;

    const playheadX = currentStep * STEP_WIDTH;
    const scrollLeft = gridRef.current.scrollLeft;
    const clientWidth = gridRef.current.clientWidth;

    const isOutOfViewport =
      playheadX < scrollLeft || playheadX > scrollLeft + clientWidth;
    const isEvery8Steps = currentStep % 8 === 0;

    if (isOutOfViewport || isEvery8Steps) {
      const targetScrollLeft = playheadX - clientWidth / 2;
      if (typeof gridRef.current.scrollTo === 'function') {
        gridRef.current.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      } else {
        gridRef.current.scrollLeft = Math.max(0, targetScrollLeft);
      }
    }
  }, [currentStep, gridRef]);

  const handleGridScroll = () => {
    if (!gridRef.current || !bunkafuRef.current) return;
    if (bunkafuRef.current.scrollLeft !== gridRef.current.scrollLeft) {
      bunkafuRef.current.scrollLeft = gridRef.current.scrollLeft;
    }
  };

  const handleBunkafuScroll = () => {
    if (!gridRef.current || !bunkafuRef.current) return;
    if (gridRef.current.scrollLeft !== bunkafuRef.current.scrollLeft) {
      gridRef.current.scrollLeft = bunkafuRef.current.scrollLeft;
    }
  };

  return {
    handleGridScroll,
    handleBunkafuScroll
  };
};

export default useAutoScroll;
