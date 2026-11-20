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
import { useRemoteConfig } from './hooks/useRemoteConfig';
import { AdminPage } from './components/Admin/AdminPage';

const isAdmin = window.location.hash === '#admin';

const App = () => {
  const debug = useDebugConfig();
  const now = useNow(250, debug.clockOffsetMs);
  const state = useScheduleState(now);
  const pointerActive = usePointerActivity(2200);
  const weatherLive = useWeather();
  const { isFullscreen, enter } = useFullscreen();
  const pin = useCornerPin();
  const remote = useRemoteConfig();

  // Beeld-opdracht van het admin-paneel gaat above de lokale instellingen.
  const config = {
    ...debug,
    forcedMode: remote?.thema ?? debug.forcedMode,
    forcedSeason: (remote?.seizoen as never) ?? debug.forcedSeason,
    forcedWeather: (remote?.weer as never) ?? debug.forcedWeather,
    forcedHoliday: (remote?.feest as never) ?? debug.forcedHoliday,
    customTitle: remote?.titel !== undefined ? remote.titel : debug.customTitle,
    customTitleOn: remote?.titelOn ?? debug.customTitleOn,
    customRange: remote?.tijd !== undefined ? remote.tijd : debug.customRange,
    customRangeOn: remote?.tijdOn ?? debug.customRangeOn,
    ticker: remote?.mededeling !== undefined ? remote.mededeling : debug.ticker,
    tickerOn: remote?.mededelingOn ?? debug.tickerOn,
    speed: remote?.snelheid ?? debug.speed,
    sizeScale: remote?.grootte ?? debug.sizeScale,
    blendOn: remote?.overgangOn ?? debug.blendOn,
    dayOverviewOn: remote?.lesurenOn ?? debug.dayOverviewOn,
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-ui-layer]')) return;
    void enter();
  };

  return (
    <div className="app" onClick={isAdmin ? undefined : handleClick}>
      {isAdmin ? (
        <AdminPage />
      ) : (
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
          forcedMode={config.forcedMode}
          forcedSeason={config.forcedSeason}
          forcedWeather={config.forcedWeather}
          weatherLive={weatherLive}
          forcedHoliday={config.forcedHoliday}
          customTitle={config.customTitle}
          customTitleOn={config.customTitleOn}
          customRange={config.customRange}
          customRangeOn={config.customRangeOn}
          speed={config.speed}
          sizeScale={config.sizeScale}
          blendOn={config.blendOn}
          ticker={config.ticker}
          tickerOn={config.tickerOn}
          dayOverviewOn={config.dayOverviewOn}
          debug={config}
        />
      </CornerPinStage>
      )}
    </div>
  );
};

export default App;
