import { useShotStore } from '../state/shotStore';
import { BallLaunchForm } from './panels/BallLaunchForm';
import { ClubDeliveryForm } from './panels/ClubDeliveryForm';
import { DerivedLaunchPanel } from './panels/DerivedLaunchPanel';
import { EnvPanel } from './panels/EnvPanel';
import { ReadoutPanel } from './panels/ReadoutPanel';
import { SideProfilePlot } from './plots/SideProfilePlot';
import { TopDownPlot } from './plots/TopDownPlot';
import { Scene } from './scene/Scene';
import { UnitsToggle } from './controls/UnitsToggle';
import { ModeToggle } from './controls/ModeToggle';

export function App() {
  const mode = useShotStore((s) => s.mode);
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Golfshot Sim</h1>
        <div className="app-header-controls">
          <ModeToggle />
          <UnitsToggle />
        </div>
      </header>

      <main className="app-main">
        <aside className="app-side">
          {mode === 'launch' ? <BallLaunchForm /> : <ClubDeliveryForm />}
          <DerivedLaunchPanel />
          <EnvPanel />
        </aside>

        <section className="app-content">
          <ReadoutPanel />
          <Scene />
          <div className="plot-row">
            <SideProfilePlot />
            <TopDownPlot />
          </div>
        </section>
      </main>
    </div>
  );
}
