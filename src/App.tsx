import type { MouseEvent } from 'react';
import { CornerPinStage } from './components/CornerPin/CornerPinStage';
import { Screen } from './components/Layout/Screen';
import { useCornerPin } from './hooks/useCornerPin';
import { useDebugConfig } from './hooks/useDebugConfig';
import { useFullscreen } from './hooks/useFullscreen';
import { useNow } from './hooks/useNow';
import { usePointerActivity } from './hooks/usePointerActivity';
import { useScheduleState } from './hooks/useScheduleState';
import { useWeather } from './hooks/useWeather';

const App = () => {
  const debug = useDebugConfig();
  const now = useNow(250, debug.clockOffsetMs);
  const state = useScheduleState(now);
  const pointerActive = usePointerActivity(2200);
  const weatherLive = useWeather();
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
          forcedMode={debug.forcedMode}
          forcedSeason={debug.forcedSeason}
          forcedWeather={debug.forcedWeather}
          weatherLive={weatherLive}
          forcedHoliday={debug.forcedHoliday}
          customTitle={debug.customTitle}
          customTitleOn={debug.customTitleOn}
          customRange={debug.customRange}
          customRangeOn={debug.customRangeOn}
          speed={debug.speed}
          sizeScale={debug.sizeScale}
          blendOn={debug.blendOn}
          ticker={debug.ticker}
          tickerOn={debug.tickerOn}
          dayOverviewOn={debug.dayOverviewOn}
          debug={debug}
        />
      </CornerPinStage>
    </div>
  );
};

export default App;
