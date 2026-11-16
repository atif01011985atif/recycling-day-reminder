/**
 * Recycling Day Reminder — screen state machine only.
 * Recurrence, search and household state live outside this file.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { HouseholdProvider } from './src/hooks/useHousehold';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { SortGuideScreen } from './src/screens/SortGuideScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { theme } from './src/constants/theme';
import type { Screen, TabKey } from './src/types';

function Router() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [activeBinId, setActiveBinId] = useState<string | null>(null);
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  /** Android back: leave sub-screens before the app exits at This Week. */
  useEffect(() => {
    const onBack = () => {
      const current = screenRef.current;
      if (current === 'menu' || current === 'loader') {
        return false;
      }
      if (current === 'schedule') {
        setScreen('game');
        return true;
      }
      if (current === 'about') {
        setScreen('settings');
        return true;
      }
      setScreen('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  const goTab = useCallback((tab: TabKey) => setScreen(tab), []);

  const openSchedule = useCallback((binId: string) => {
    setActiveBinId(binId);
    setScreen('schedule');
  }, []);

  const openResult = useCallback((binId: string) => {
    setActiveBinId(binId);
    setScreen('gameover');
  }, []);

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goBins = useCallback(() => setScreen('game'), []);

  switch (screen) {
    case 'loader':
      return <LoaderScreen onDone={goMenu} />;

    case 'game':
      return (
        <GameScreen
          onSchedule={openSchedule}
          onOpenResult={openResult}
          onSelectTab={goTab}
        />
      );

    case 'schedule':
      return activeBinId ? (
        <ScheduleScreen
          binId={activeBinId}
          onBack={goBins}
          onSaved={openResult}
        />
      ) : (
        <GameScreen
          onSchedule={openSchedule}
          onOpenResult={openResult}
          onSelectTab={goTab}
        />
      );

    case 'gameover':
      return activeBinId ? (
        <GameOverScreen
          binId={activeBinId}
          onEditAgain={openSchedule}
          onDone={goMenu}
        />
      ) : (
        <MenuScreen
          onStartPlanning={goBins}
          onEditBin={openSchedule}
          onOpenGuide={() => setScreen('sortGuide')}
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={goTab}
        />
      );

    case 'sortGuide':
      return <SortGuideScreen onSetUpBin={goBins} onSelectTab={goTab} />;

    case 'settings':
      return (
        <SettingsScreen
          onOpenAbout={() => setScreen('about')}
          onDeleted={goMenu}
          onSelectTab={goTab}
        />
      );

    case 'about':
      return <AboutScreen onBack={() => setScreen('settings')} />;

    case 'menu':
    default:
      return (
        <MenuScreen
          onStartPlanning={goBins}
          onEditBin={openSchedule}
          onOpenGuide={() => setScreen('sortGuide')}
          onOpenSettings={() => setScreen('settings')}
          onSelectTab={goTab}
        />
      );
  }
}

export default function App() {
  return (
    <HouseholdProvider>
      <View style={styles.root}>
        <Router />
      </View>
    </HouseholdProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg.primary },
});
