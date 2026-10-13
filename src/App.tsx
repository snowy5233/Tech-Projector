import type { MouseEvent } from 'react';
import { CornerPinStage } from './components/CornerPin/CornerPinStage';
import { Screen } from './components/Layout/Screen';
import { useCornerPin } from './hooks/useCornerPin';
import { useDebugConfig } from './hooks/useDebugConfig';
import { useFullscreen } from './hooks/useFullscreen';
import { useNow } from './hooks/useNow';
import { usePointerActivity } from './hooks/usePointerActivity';
import { useScheduleState } from './hooks/useScheduleState';

const App = () => {
  const debug = useDebugConfig();
  const now = useNow(250, debug.clockOffsetMs);
  const state = useScheduleState(now);
  const pointerActive = usePointerActivity(2200);
  const { isFullscreen, enter } = useFullscreen();
  const pin = useCornerPin();

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-ui-layer]')) return;
    void enter();
  };

  return (
    <div className="app" onClick={handleClick}>
      <CornerPinStage
        quad={pin.quad}
        onMove={pin.moveCorner}
        onNudge={pin.nudgeCorner}
        showHandles={pointerActive}
      >
        <Screen
          now={now}
          state={state}
          pointerActive={pointerActive}
          canResetPin={!pin.isDefault}
          isFullscreen={isFullscreen}
          onResetPin={pin.reset}
          forcedModeIndex={debug.forcedModeIndex}
          debug={debug}
        />
      </CornerPinStage>
    </div>
  );
};

export default App;
